import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config";
import { prisma } from "./db";
import { AppError } from "./http";

export const signToken = (userId: string) => jwt.sign({ sub: userId }, config.JWT_SECRET, { expiresIn: "12h" });

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization");
    if (header?.startsWith("Bearer ")) {
      const payload = jwt.verify(header.slice(7), config.JWT_SECRET);
      if (typeof payload === "string" || !payload.sub) throw new AppError(401, "UNAUTHORIZED", "Invalid access token");
      const user = await prisma.user.findFirst({ where: { id: String(payload.sub), deletedAt: null } });
      if (!user) throw new AppError(401, "UNAUTHORIZED", "User no longer exists");
      req.authUserId = user.id;
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

export async function activeFamilyMembership(userId: string, familyId: string) {
  const membership = await prisma.familyMembership.findFirst({ where: { userId, familyId, status: "active" }, include: { family: true } });
  if (!membership) throw new AppError(404, "FAMILY_NOT_FOUND", "Family was not found");
  return membership;
}
