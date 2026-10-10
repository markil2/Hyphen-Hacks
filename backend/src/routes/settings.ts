import { Router } from "express";
import { z } from "zod";
import { config } from "../config";
import { prisma } from "../db";
import { AppError, ok, validate } from "../http";

export const settingsRouter = Router();

settingsRouter.get("/settings/account", async (req, res, next) => {
  try { const user = await prisma.user.findUnique({ where: { id: req.authUserId }, select: { id: true, name: true, email: true, emailVerifiedAt: true, createdAt: true, familyMemberships: { where: { status: "active" }, include: { family: true } } } }); ok(res, user); } catch (e) { next(e); }
});
settingsRouter.get("/settings/privacy", async (req, res, next) => {
  try { const consents = await prisma.privacyConsent.findMany({ where: { userId: req.authUserId }, orderBy: { acceptedAt: "desc" } }); ok(res, { currentPolicyVersion: config.PRIVACY_POLICY_VERSION, currentAccepted: consents.some((item) => item.policyVersion === config.PRIVACY_POLICY_VERSION), consents, controls: { exportAvailable: true, accountDeletionAvailable: true, familyAccessManagedSeparately: true } }); } catch (e) { next(e); }
});
settingsRouter.post("/settings/privacy/consent", validate(z.object({ body: z.object({ policyVersion: z.string().min(1).max(50) }) })), async (req, res, next) => {
  try { if (req.body.policyVersion !== config.PRIVACY_POLICY_VERSION) throw new AppError(400, "POLICY_VERSION_MISMATCH", "Accept the current privacy policy version"); const consent = await prisma.privacyConsent.upsert({ where: { userId_policyVersion: { userId: req.authUserId!, policyVersion: req.body.policyVersion } }, create: { userId: req.authUserId!, policyVersion: req.body.policyVersion }, update: { acceptedAt: new Date() } }); ok(res, consent, "Privacy consent recorded"); } catch (e) { next(e); }
});
settingsRouter.get("/settings/export", async (req, res, next) => {
  try { const user = await prisma.user.findUnique({ where: { id: req.authUserId }, select: { id: true, name: true, email: true, emailVerifiedAt: true, createdAt: true } }); const memberships = await prisma.familyMembership.findMany({ where: { userId: req.authUserId, status: "active" }, include: { family: true } }); const familyIds = memberships.map((item) => item.familyId); const babies = await prisma.baby.findMany({ where: { OR: [{ userId: req.authUserId }, { familyId: { in: familyIds } }] }, include: { sleepSessions: true, feedings: true, diaperChanges: true, heightMeasurements: true, milestones: true, healthObservations: true } }); const maternal = await prisma.maternalProfile.findUnique({ where: { userId: req.authUserId! }, include: { menstrualLogs: true, pregnancyLogs: true, healthMeasurements: true, hormoneMeasurements: true } }); const questions = await prisma.parentQuestion.findMany({ where: { userId: req.authUserId } }); const consultations = await prisma.consultationRequest.findMany({ where: { userId: req.authUserId } }); ok(res, { exportedAt: new Date(), user, families: memberships, babies, maternal, questions, consultations }); } catch (e) { next(e); }
});

// Name changes live here; email and password changes go through Supabase Auth in the app.
settingsRouter.patch("/settings/account", validate(z.object({ body: z.object({ name: z.string().trim().min(1).max(100) }) })), async (req, res, next) => {
  try { const updated = await prisma.user.update({ where: { id: req.authUserId }, data: { name: req.body.name }, select: { id: true, name: true, email: true, emailVerifiedAt: true } }); ok(res, { user: updated }, "Account settings updated"); } catch (e) { next(e); }
});

/** Remove the Supabase Auth user so the person can no longer sign in. Needs the server-only service-role key. */
async function deleteSupabaseUser(supabaseUserId: string) {
  if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) return false;
  const response = await fetch(`${config.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/admin/users/${supabaseUserId}`, {
    method: "DELETE",
    headers: { apikey: config.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${config.SUPABASE_SERVICE_ROLE_KEY}` },
  });
  if (!response.ok && response.status !== 404) throw new AppError(502, "AUTH_DELETE_FAILED", "Your data was removed, but the sign-in account could not be deleted. Please contact support.");
  return true;
}

settingsRouter.delete("/settings/account", validate(z.object({ body: z.object({ confirmation: z.literal("DELETE MY ACCOUNT") }) })), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.authUserId } });
    if (!user || user.deletedAt) throw new AppError(401, "UNAUTHORIZED", "Account is unavailable");
    if (!user.supabaseUserId) throw new AppError(403, "DEMO_ACCOUNT", "The shared demo account can't be deleted");
    const memberships = await prisma.familyMembership.findMany({ where: { userId: user.id, status: "active" } });
    for (const membership of memberships) { if (membership.role === "owner") { const otherOwner = await prisma.familyMembership.findFirst({ where: { familyId: membership.familyId, role: "owner", status: "active", NOT: { userId: user.id } } }); const another = await prisma.familyMembership.findFirst({ where: { familyId: membership.familyId, status: "active", NOT: { userId: user.id } } }); if (!otherOwner && another) await prisma.familyMembership.update({ where: { id: another.id }, data: { role: "owner" } }); } }
    await prisma.$transaction(async (tx) => { await tx.parentQuestion.deleteMany({ where: { userId: user.id } }); await tx.consultationRequest.deleteMany({ where: { userId: user.id } }); await tx.maternalProfile.deleteMany({ where: { userId: user.id } }); await tx.privacyConsent.deleteMany({ where: { userId: user.id } }); await tx.familyMembership.updateMany({ where: { userId: user.id }, data: { status: "removed" } }); await tx.user.update({ where: { id: user.id }, data: { name: "Deleted User", email: `deleted-${user.id}@deleted.invalid`, emailVerifiedAt: null, deletedAt: new Date() } }); });
    const authAccountDeleted = await deleteSupabaseUser(user.supabaseUserId);
    ok(res, { accountDeleted: true, authAccountDeleted, familyRecordsPreservedForRemainingMembers: true }, "Account deleted");
  } catch (e) { next(e); }
});
