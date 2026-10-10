import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db";
import { authenticate, signToken } from "../auth";
import { AppError, ok, validate } from "../http";
import { config } from "../config";
import { createRawToken, hashToken, sendEmail } from "../email";

export const authRouter = Router();
const credentials = z.object({ body: z.object({ email: z.string().email(), password: z.string().min(8).max(128) }) });

authRouter.post("/register", validate(credentials.extend({ body: credentials.shape.body.extend({ name: z.string().trim().min(1).max(100) }) })), async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) throw new AppError(409, "EMAIL_IN_USE", "An account already uses this email");
    const rawToken = createRawToken();
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { name: req.body.name, email, passwordHash: await bcrypt.hash(req.body.password, 12) } });
      const family = await tx.family.create({ data: { name: `${req.body.name}'s family` } });
      await tx.familyMembership.create({ data: { familyId: family.id, userId: created.id, role: "owner" } });
      await tx.accountEmailToken.create({ data: { userId: created.id, type: "verify_email", tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + 24 * 3600000) } });
      return created;
    });
    await sendEmail({ to: user.email, subject: "Verify your Nurture account", text: `Verify your account: ${config.APP_BASE_URL}/verify-email?token=${rawToken}\n\nThis link expires in 24 hours.` });
    ok(res, { user: { id: user.id, name: user.name, email: user.email, emailVerifiedAt: null }, emailSent: true, ...(config.EMAIL_PROVIDER === "console" && { developmentToken: rawToken }) }, "Account created. Check your email to verify it.", 201);
  } catch (error) { next(error); }
});

authRouter.post("/verify-email", validate(z.object({ body: z.object({ token: z.string().min(32) }) })), async (req, res, next) => {
  try {
    const token = await prisma.accountEmailToken.findUnique({ where: { tokenHash: hashToken(req.body.token) }, include: { user: true } });
    if (!token || token.type !== "verify_email" || token.usedAt || token.expiresAt <= new Date()) throw new AppError(400, "INVALID_TOKEN", "Verification token is invalid or expired");
    const user = await prisma.$transaction(async (tx) => { await tx.accountEmailToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }); return tx.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: new Date() } }); });
    ok(res, { user: { id: user.id, name: user.name, email: user.email, emailVerifiedAt: user.emailVerifiedAt }, token: signToken(user.id) }, "Email verified");
  } catch (error) { next(error); }
});

authRouter.post("/resend-verification", validate(z.object({ body: z.object({ email: z.string().email() }) })), async (req, res, next) => {
  try { const user = await prisma.user.findUnique({ where: { email: req.body.email.toLowerCase() } }); if (user && !user.emailVerifiedAt && !user.deletedAt) { const rawToken = createRawToken(); await prisma.accountEmailToken.create({ data: { userId: user.id, type: "verify_email", tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + 24 * 3600000) } }); await sendEmail({ to: user.email, subject: "Verify your Nurture account", text: `Verify your account: ${config.APP_BASE_URL}/verify-email?token=${rawToken}` }); return ok(res, { emailSent: true, ...(config.EMAIL_PROVIDER === "console" && { developmentToken: rawToken }) }, "If the account is eligible, a verification email was sent"); } ok(res, { emailSent: true }, "If the account is eligible, a verification email was sent"); } catch (error) { next(error); }
});

authRouter.post("/login", validate(credentials), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email.toLowerCase() } });
    if (!user?.passwordHash || user.deletedAt || !(await bcrypt.compare(req.body.password, user.passwordHash))) throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
    if (!user.emailVerifiedAt) throw new AppError(403, "EMAIL_NOT_VERIFIED", "Verify your email before signing in");
    ok(res, { user: { id: user.id, name: user.name, email: user.email }, token: signToken(user.id) }, "Signed in");
  } catch (error) { next(error); }
});

authRouter.post("/forgot-password", validate(z.object({ body: z.object({ email: z.string().email() }) })), async (req, res, next) => {
  try { const user = await prisma.user.findUnique({ where: { email: req.body.email.toLowerCase() } }); if (user?.passwordHash && !user.deletedAt) { const rawToken = createRawToken(); await prisma.accountEmailToken.create({ data: { userId: user.id, type: "reset_password", tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + 3600000) } }); await sendEmail({ to: user.email, subject: "Reset your Nurture password", text: `Reset your password: ${config.APP_BASE_URL}/reset-password?token=${rawToken}\n\nThis link expires in one hour.` }); return ok(res, { emailSent: true, ...(config.EMAIL_PROVIDER === "console" && { developmentToken: rawToken }) }, "If an account exists, a reset email was sent"); } ok(res, { emailSent: true }, "If an account exists, a reset email was sent"); } catch (error) { next(error); }
});

authRouter.post("/reset-password", validate(z.object({ body: z.object({ token: z.string().min(32), password: z.string().min(8).max(128) }) })), async (req, res, next) => {
  try { const token = await prisma.accountEmailToken.findUnique({ where: { tokenHash: hashToken(req.body.token) } }); if (!token || token.type !== "reset_password" || token.usedAt || token.expiresAt <= new Date()) throw new AppError(400, "INVALID_TOKEN", "Reset token is invalid or expired"); await prisma.$transaction([prisma.accountEmailToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }), prisma.user.update({ where: { id: token.userId }, data: { passwordHash: await bcrypt.hash(req.body.password, 12) } })]); ok(res, { passwordReset: true }, "Password reset successfully"); } catch (error) { next(error); }
});

authRouter.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.authUserId }, select: { id: true, name: true, email: true, emailVerifiedAt: true, createdAt: true } });
    if (!user) throw new AppError(401, "UNAUTHORIZED", "User no longer exists");
    ok(res, user);
  } catch (error) { next(error); }
});
