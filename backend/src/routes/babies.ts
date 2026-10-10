import { Router } from "express";
import { z } from "zod";
import { activeFamilyMembership, ownedBaby } from "../auth";
import { prisma } from "../db";
import { AppError, ok, validate } from "../http";
import { babyParams } from "../schemas";

export const babiesRouter = Router();
const babyBodyBase = z.object({ name: z.string().trim().min(1).max(100), birthDate: z.coerce.date().refine((v) => v <= new Date(), "Birth date cannot be in the future"), familyId: z.string().nullable().optional(), sexAtBirth: z.enum(["female", "male", "intersex", "not_recorded"]).nullable().optional(), initialWeight: z.coerce.number().positive().nullable().optional(), weightUnit: z.enum(["kg", "lb", "oz"]).nullable().optional(), initialHeight: z.coerce.number().positive().nullable().optional(), heightUnit: z.enum(["cm", "in"]).nullable().optional() });
const babyBody = babyBodyBase.superRefine((value, ctx) => { if (value.initialWeight != null && !value.weightUnit) ctx.addIssue({ code: "custom", path: ["weightUnit"], message: "Required with initialWeight" }); if (value.initialHeight != null && !value.heightUnit) ctx.addIssue({ code: "custom", path: ["heightUnit"], message: "Required with initialHeight" }); });

babiesRouter.post("/babies", validate(z.object({ body: babyBody })), async (req, res, next) => {
  try { let familyId = req.body.familyId; if (familyId) await activeFamilyMembership(req.authUserId!, familyId); else familyId = (await prisma.familyMembership.findFirst({ where: { userId: req.authUserId, status: "active" }, orderBy: { joinedAt: "asc" } }))?.familyId ?? null; ok(res, await prisma.baby.create({ data: { ...req.body, familyId, userId: req.authUserId! } }), "Baby profile created", 201); } catch (e) { next(e); }
});
babiesRouter.get("/babies", async (req, res, next) => {
  try { ok(res, await prisma.baby.findMany({ where: { OR: [{ userId: req.authUserId }, { family: { memberships: { some: { userId: req.authUserId, status: "active" } } } }] }, orderBy: { createdAt: "asc" } })); } catch (e) { next(e); }
});
babiesRouter.get("/babies/:babyId", validate(babyParams), async (req, res, next) => {
  try { ok(res, await ownedBaby(req.authUserId!, req.params.babyId)); } catch (e) { next(e); }
});
babiesRouter.patch("/babies/:babyId", validate(z.object({ params: babyParams.shape.params, body: babyBodyBase.partial().refine((v) => Object.keys(v).length > 0) })), async (req, res, next) => {
  try { await ownedBaby(req.authUserId!, req.params.babyId); if (req.body.familyId) await activeFamilyMembership(req.authUserId!, req.body.familyId); ok(res, await prisma.baby.update({ where: { id: req.params.babyId }, data: req.body }), "Baby profile updated"); } catch (e) { next(e); }
});
babiesRouter.delete("/babies/:babyId", validate(babyParams), async (req, res, next) => {
  try { await ownedBaby(req.authUserId!, req.params.babyId); await prisma.baby.delete({ where: { id: req.params.babyId } }); ok(res, { id: req.params.babyId }, "Baby profile deleted"); } catch (e) { next(e); }
});
