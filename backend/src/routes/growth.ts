import { Router } from "express";
import { z } from "zod";
import { ownedBaby } from "../auth";
import { prisma } from "../db";
import { AppError, ok, validate } from "../http";
import { babyParams, idParams, pagination } from "../schemas";

export const growthRouter = Router();
const notice = "Measurements are parent-recorded tracking data. Nurture does not calculate growth percentiles or interpret development.";
const body = z.object({
  height: z.coerce.number().positive().max(300),
  unit: z.enum(["cm", "in"]),
  measuredAt: z.coerce.date().default(() => new Date()),
  notes: z.string().trim().max(1000).nullable().optional(),
}).superRefine((value, ctx) => {
  if (value.unit === "cm" && (value.height < 20 || value.height > 250)) ctx.addIssue({ code: "custom", path: ["height"], message: "Centimeter height appears invalid" });
  if (value.unit === "in" && (value.height < 8 || value.height > 100)) ctx.addIssue({ code: "custom", path: ["height"], message: "Inch height appears invalid" });
});

growthRouter.post("/babies/:babyId/heights", validate(z.object({ params: babyParams.shape.params, body })), async (req, res, next) => {
  try { await ownedBaby(req.authUserId!, req.params.babyId); const measurement = await prisma.babyHeightMeasurement.create({ data: { ...req.body, babyId: req.params.babyId } }); ok(res, { measurement, notice }, "Height measurement recorded", 201); } catch (e) { next(e); }
});
growthRouter.get("/babies/:babyId/heights", validate(z.object({ params: babyParams.shape.params, query: pagination })), async (req, res, next) => {
  try { await ownedBaby(req.authUserId!, req.params.babyId); const { page, limit } = req.query as any; const where = { babyId: req.params.babyId }; const [items, total] = await Promise.all([prisma.babyHeightMeasurement.findMany({ where, orderBy: { measuredAt: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.babyHeightMeasurement.count({ where })]); ok(res, { items, latest: items[0] ?? null, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, notice }); } catch (e) { next(e); }
});
growthRouter.get("/babies/:babyId/heights/latest", validate(babyParams), async (req, res, next) => {
  try { await ownedBaby(req.authUserId!, req.params.babyId); const measurement = await prisma.babyHeightMeasurement.findFirst({ where: { babyId: req.params.babyId }, orderBy: { measuredAt: "desc" } }); ok(res, { measurement, notice }); } catch (e) { next(e); }
});
growthRouter.patch("/heights/:id", validate(z.object({ params: idParams.shape.params, body: z.object({ height: z.coerce.number().positive().max(300).optional(), unit: z.enum(["cm", "in"]).optional(), measuredAt: z.coerce.date().optional(), notes: z.string().trim().max(1000).nullable().optional() }).refine((value) => Object.keys(value).length > 0) })), async (req, res, next) => {
  try { const item = await prisma.babyHeightMeasurement.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, "HEIGHT_NOT_FOUND", "Height measurement was not found"); await ownedBaby(req.authUserId!, item.babyId); const unit = req.body.unit ?? item.unit; const height = req.body.height ?? item.height; if ((unit === "cm" && (height < 20 || height > 250)) || (unit === "in" && (height < 8 || height > 100))) throw new AppError(400, "INVALID_HEIGHT", "Height is outside the accepted entry range for its unit"); const measurement = await prisma.babyHeightMeasurement.update({ where: { id: item.id }, data: req.body }); ok(res, { measurement, notice }, "Height measurement updated"); } catch (e) { next(e); }
});
growthRouter.delete("/heights/:id", validate(idParams), async (req, res, next) => {
  try { const item = await prisma.babyHeightMeasurement.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, "HEIGHT_NOT_FOUND", "Height measurement was not found"); await ownedBaby(req.authUserId!, item.babyId); await prisma.babyHeightMeasurement.delete({ where: { id: item.id } }); ok(res, { id: item.id }, "Height measurement deleted"); } catch (e) { next(e); }
});
