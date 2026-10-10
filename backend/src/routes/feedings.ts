import { Router } from "express";
import { z } from "zod";
import { ownedBaby } from "../auth";
import { prisma } from "../db";
import { AppError, ok, validate } from "../http";
import { babyParams, ensureDateRange, feedingTypes, feedingUnits, idParams, pagination } from "../schemas";

export const feedingsRouter = Router();
const bodyBase = z.object({ feedingType: z.enum(feedingTypes), feedingMethod: z.enum(["breast", "bottle", "solid"]).nullable().optional(), milkType: z.enum(["breast_milk", "formula", "mixed"]).nullable().optional(), amount: z.coerce.number().positive().nullable().optional(), unit: z.enum(feedingUnits).nullable().optional(), foodName: z.string().trim().max(200).nullable().optional(), foodDescription: z.string().trim().max(1000).nullable().optional(), startTime: z.coerce.date().optional(), endTime: z.coerce.date().nullable().optional(), notes: z.string().trim().max(1000).nullable().optional() });
const body = bodyBase.superRefine((v, ctx) => {
  if (v.amount != null && !v.unit) ctx.addIssue({ code: "custom", path: ["unit"], message: "unit is required when amount is supplied" });
  if (v.feedingMethod === "bottle" && !v.milkType) ctx.addIssue({ code: "custom", path: ["milkType"], message: "milkType is required for bottle feedings" });
  if (v.feedingType === "solids" && !v.foodName) ctx.addIssue({ code: "custom", path: ["foodName"], message: "foodName is required for solid food entries" });
  if (v.endTime && v.startTime) try { ensureDateRange(v.startTime, v.endTime); } catch { ctx.addIssue({ code: "custom", path: ["endTime"], message: "endTime cannot precede startTime" }); }
});

feedingsRouter.post("/babies/:babyId/feedings", validate(z.object({ params: babyParams.shape.params, body })), async (req, res, next) => {
  try { await ownedBaby(req.authUserId!, req.params.babyId); ok(res, await prisma.feedingSession.create({ data: { ...req.body, startTime: req.body.startTime ?? new Date(), babyId: req.params.babyId } }), "Feeding recorded", 201); } catch (e) { next(e); }
});
feedingsRouter.get("/babies/:babyId/feedings", validate(z.object({ params: babyParams.shape.params, query: pagination.extend({ from: z.coerce.date().optional(), to: z.coerce.date().optional(), type: z.enum(feedingTypes).optional() }) })), async (req, res, next) => {
  try { await ownedBaby(req.authUserId!, req.params.babyId); const { page, limit, from, to, type } = req.query as any; const where = { babyId: req.params.babyId, ...(type && { feedingType: type }), startTime: { ...(from && { gte: from }), ...(to && { lte: to }) } }; const [items, total] = await Promise.all([prisma.feedingSession.findMany({ where, orderBy: { startTime: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.feedingSession.count({ where })]); ok(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }); } catch (e) { next(e); }
});
feedingsRouter.patch("/feedings/:id", validate(z.object({ params: idParams.shape.params, body: bodyBase.partial().refine((v) => Object.keys(v).length > 0) })), async (req, res, next) => {
  try { const item = await prisma.feedingSession.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, "FEEDING_NOT_FOUND", "Feeding was not found"); await ownedBaby(req.authUserId!, item.babyId); const start = req.body.startTime ?? item.startTime; const end = req.body.endTime === undefined ? item.endTime : req.body.endTime; ensureDateRange(start, end); ok(res, await prisma.feedingSession.update({ where: { id: item.id }, data: req.body }), "Feeding updated"); } catch (e) { next(e); }
});
feedingsRouter.delete("/feedings/:id", validate(idParams), async (req, res, next) => {
  try { const item = await prisma.feedingSession.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, "FEEDING_NOT_FOUND", "Feeding was not found"); await ownedBaby(req.authUserId!, item.babyId); await prisma.feedingSession.delete({ where: { id: item.id } }); ok(res, { id: item.id }, "Feeding deleted"); } catch (e) { next(e); }
});
feedingsRouter.get("/babies/:babyId/feeding-summary", validate(z.object({ params: babyParams.shape.params, query: z.object({ date: z.string().date().optional(), timezoneOffsetMinutes: z.coerce.number().int().min(-840).max(840).default(0) }) })), async (req, res, next) => {
  try { await ownedBaby(req.authUserId!, req.params.babyId); const offset = Number(req.query.timezoneOffsetMinutes); const local = req.query.date ? new Date(`${req.query.date}T00:00:00.000Z`) : new Date(Date.now() - offset * 60000); local.setUTCHours(0, 0, 0, 0); const start = new Date(local.getTime() + offset * 60000); const end = new Date(start.getTime() + 86400000); const entries = await prisma.feedingSession.findMany({ where: { babyId: req.params.babyId, startTime: { gte: start, lt: end } }, orderBy: { startTime: "asc" } }); const byType = entries.reduce<Record<string, { count: number; amountByUnit: Record<string, number> }>>((acc, entry) => { const group = acc[entry.feedingType] ??= { count: 0, amountByUnit: {} }; group.count++; if (entry.amount && entry.unit) group.amountByUnit[entry.unit] = (group.amountByUnit[entry.unit] ?? 0) + entry.amount; return acc; }, {}); ok(res, { date: local.toISOString().slice(0, 10), timezoneOffsetMinutes: offset, count: entries.length, byType, entries }); } catch (e) { next(e); }
});
