import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, decodeProtectedHeader, JWTPayload, jwtVerify } from "jose";
import jwt from "jsonwebtoken";
import { config, supabaseIssuer } from "./config";
import { prisma } from "./db";
import { AppError } from "./http";

/**
 * Authentication is Supabase Auth. The app signs people in with Supabase and sends the
 * Supabase access token as `Authorization: Bearer <token>`; this middleware verifies it and
 * maps the Supabase user to a Nurture user row (created on first sign-in).
 */

interface SupabaseClaims extends JWTPayload {
  sub: string;
  email?: string;
  role?: string;
  user_metadata?: { name?: string; full_name?: string };
}

const jwks = supabaseIssuer ? createRemoteJWKSet(new URL(`${supabaseIssuer}/.well-known/jwks.json`)) : null;

export async function verifySupabaseToken(token: string): Promise<SupabaseClaims> {
  const { alg } = decodeProtectedHeader(token);
  let payload: JWTPayload;
  if (alg === "HS256") {
    // Legacy shared-secret projects (and the test suite).
    if (!config.SUPABASE_JWT_SECRET) throw new AppError(401, "UNAUTHORIZED", "Invalid access token");
    payload = jwt.verify(token, config.SUPABASE_JWT_SECRET, { algorithms: ["HS256"], audience: "authenticated", ...(supabaseIssuer && { issuer: supabaseIssuer }) }) as JWTPayload;
  } else {
    if (!jwks) throw new AppError(401, "UNAUTHORIZED", "Invalid access token");
    ({ payload } = await jwtVerify(token, jwks, { issuer: supabaseIssuer, audience: "authenticated" }));
  }
  if (!payload.sub || (payload as SupabaseClaims).role !== "authenticated") throw new AppError(401, "UNAUTHORIZED", "Invalid access token");
  return payload as SupabaseClaims;
}

const displayName = (claims: SupabaseClaims) =>
  (claims.user_metadata?.name || claims.user_metadata?.full_name || claims.email?.split("@")[0] || "Parent").trim().slice(0, 100);

/** Find the Nurture user for a Supabase user, linking by email or creating one (with a household) the first time. */
export async function userForSupabase(claims: SupabaseClaims) {
  const existing = await prisma.user.findUnique({ where: { supabaseUserId: claims.sub } });
  if (existing) {
    if (existing.deletedAt) throw new AppError(401, "UNAUTHORIZED", "This account was deleted");
    return existing;
  }
  const email = claims.email?.toLowerCase();
  if (!email) throw new AppError(401, "UNAUTHORIZED", "The access token has no email address");

  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    if (byEmail.supabaseUserId || byEmail.deletedAt) throw new AppError(409, "ACCOUNT_CONFLICT", "This email is already linked to another account");
    return prisma.user.update({ where: { id: byEmail.id }, data: { supabaseUserId: claims.sub, emailVerifiedAt: byEmail.emailVerifiedAt ?? new Date() } });
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const name = displayName(claims);
      const user = await tx.user.create({ data: { name, email, supabaseUserId: claims.sub, emailVerifiedAt: new Date() } });
      const family = await tx.family.create({ data: { name: `${name}'s family` } });
      await tx.familyMembership.create({ data: { familyId: family.id, userId: user.id, role: "owner" } });
      return user;
    });
  } catch (error) {
    // Two first requests raced; the other one created the user.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      const user = await prisma.user.findUnique({ where: { supabaseUserId: claims.sub } });
      if (user) return user;
    }
    throw error;
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization");
    if (header?.startsWith("Bearer ")) {
      const claims = await verifySupabaseToken(header.slice(7));
      const user = await userForSupabase(claims);
      req.authUserId = user.id;
      req.supabaseUserId = claims.sub;
      return next();
    }
    if (config.DEMO_MODE) {
      const demo = await prisma.user.findUnique({ where: { email: config.DEMO_EMAIL } });
      if (!demo) throw new AppError(503, "DEMO_NOT_SEEDED", "Run the seed command before using demo mode");
      req.authUserId = demo.id;
      return next();
    }
    throw new AppError(401, "UNAUTHORIZED", "A bearer token is required");
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, "UNAUTHORIZED", "Invalid or expired access token"));
  }
}

export async function ownedBaby(userId: string, babyId: string) {
  const baby = await prisma.baby.findFirst({ where: { id: babyId, OR: [{ userId }, { family: { memberships: { some: { userId, status: "active" } } } }] } });
  if (!baby) throw new AppError(404, "BABY_NOT_FOUND", "Baby was not found");
  return baby;
}

export async function requireBabyRole(userId: string, babyId: string, roles: string[]) {
  const baby = await ownedBaby(userId, babyId);
  if (!baby.familyId) {
    if (baby.userId !== userId) throw new AppError(404, "BABY_NOT_FOUND", "Baby was not found");
    return baby;
  }
  const membership = await prisma.familyMembership.findFirst({ where: { userId, familyId: baby.familyId, status: "active" } });
  if (!membership || !roles.includes(membership.role)) throw new AppError(403, "BABY_ROLE_REQUIRED", "Your family role cannot perform this action");
  return baby;
}

export async function activeFamilyMembership(userId: string, familyId: string) {
  const membership = await prisma.familyMembership.findFirst({ where: { userId, familyId, status: "active" }, include: { family: true } });
  if (!membership) throw new AppError(404, "FAMILY_NOT_FOUND", "Family was not found");
  return membership;
}
