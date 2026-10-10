import { Router } from "express";
import { authenticate } from "../auth";
import { prisma } from "../db";
import { AppError, ok } from "../http";

/**
 * Sign-up, sign-in, email confirmation and password resets are handled by Supabase Auth
 * in the app. The API only exposes the current user's Nurture profile.
 */
export const authRouter = Router();

authRouter.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.authUserId }, select: { id: true, name: true, email: true, emailVerifiedAt: true, createdAt: true } });
    if (!user) throw new AppError(401, "UNAUTHORIZED", "User no longer exists");
    ok(res, user);
  } catch (error) { next(error); }
});
