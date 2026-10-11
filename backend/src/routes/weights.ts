import { Router } from "express";
import { z } from "zod";
import { ownedBaby } from "../auth";
import { prisma } from "../db";
import { AppError, ok, validate } from "../http";
import { babyParams, idParams, pagination } from "../schemas";

/** The baby scale: parent-recorded weights, stored exactly as entered. */
export const weightsRouter = Router();
const notice = "Weights are parent-recorded tracking data. Nurture does not calculate growth percentiles or interpret weight gain.";
const units = ["kg", "lb"] as const;
const inRange = (weight: number, unit: string) => (unit === "kg" ? weight >= 0.3 && weight <= 40 : weight >= 0.7 && weight <= 90);
const body = z.object({
  weight: z.coerce.number().positive(),
  unit: z.enum(units),
  measuredAt: z.coerce.date().default(() => new Date()),
  notes: z.string().trim().max(1000).nullable().optional(),
}).superRefine((v, ctx) => { if (!inRange(v.weight, v.unit)) ctx.addIssue({ code: "custom", path: ["weight"], message: "Weight is outside the accepted entry range for its unit" }); });

weightsRouter.post("/babies/:babyId/weights", validate(z.object({ params: babyParams.shape.params, body })), async (req, res, next) => {
  try { await ownedBaby(req.authUserId!, req.params.babyId); const measurement = await prisma.babyWeightMeasurement.create({ data: { ...req.body, babyId: req.params.babyId } }); ok(res, { measurement, notice }, "Weight recorded", 201); } catch (e) { next(e); }
});
weightsRouter.get("/babies/:babyId/weights", validate(z.object({ params: babyParams.shape.params, query: pagination })), async (req, res, next) => {
  try {
    await ownedBaby(req.authUserId!, req.params.babyId);
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const where = { babyId: req.params.babyId };
    const [items, total] = await Promise.all([prisma.babyWeightMeasurement.findMany({ where, orderBy: { measuredAt: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.babyWeightMeasurement.count({ where })]);
    ok(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, notice });
  } catch (e) { next(e); }
});
weightsRouter.patch("/weights/:id", validate(z.object({ params: idParams.shape.params, body: z.object({ weight: z.coerce.number().positive().optional(), unit: z.enum(units).optional(), measuredAt: z.coerce.date().optional(), notes: z.string().trim().max(1000).nullable().optional() }).refine((v) => Object.keys(v).length > 0) })), async (req, res, next) => {
  try {
    const item = await prisma.babyWeightMeasurement.findUnique({ where: { id: req.params.id } });
    if (!item) throw new AppError(404, "WEIGHT_NOT_FOUND", "Weight was not found");
    await ownedBaby(req.authUserId!, item.babyId);
    if (!inRange(req.body.weight ?? item.weight, req.body.unit ?? item.unit)) throw new AppError(400, "INVALID_WEIGHT", "Weight is outside the accepted entry range for its unit");
    ok(res, { measurement: await prisma.babyWeightMeasurement.update({ where: { id: item.id }, data: req.body }), notice }, "Weight updated");
  } catch (e) { next(e); }
});
weightsRouter.delete("/weights/:id", validate(idParams), async (req, res, next) => {
  try {
    const item = await prisma.babyWeightMeasurement.findUnique({ where: { id: req.params.id } });
    if (!item) throw new AppError(404, "WEIGHT_NOT_FOUND", "Weight was not found");
    await ownedBaby(req.authUserId!, item.babyId);
    await prisma.babyWeightMeasurement.delete({ where: { id: item.id } });
    ok(res, { id: item.id }, "Weight deleted");
  } catch (e) { next(e); }
});
