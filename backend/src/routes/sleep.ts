import { Router } from "express";
import { z } from "zod";
import { ownedBaby } from "../auth";
import { prisma } from "../db";
import { AppError, ok, validate } from "../http";
import { babyParams, ensureDateRange, idParams, pagination } from "../schemas";

export const sleepRouter = Router();
const notes = z.string().trim().max(1000).nullable().optional();
const duration = (start: Date, end: Date) => Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

sleepRouter.post("/babies/:babyId/sleep/start", validate(z.object({ params: babyParams.shape.params, body: z.object({ startTime: z.coerce.date().optional(), notes }) })), async (req, res, next) => {
  try {
    await ownedBaby(req.authUserId!, req.params.babyId);
    if (await prisma.sleepSession.findFirst({ where: { babyId: req.params.babyId, endTime: null } })) throw new AppError(409, "SLEEP_ALREADY_ACTIVE", "This baby already has an active sleep session");
    const startTime = req.body.startTime ?? new Date();
    if (startTime > new Date()) throw new AppError(400, "INVALID_DATE_RANGE", "startTime cannot be in the future");
    try {
      ok(res, await prisma.sleepSession.create({ data: { babyId: req.params.babyId, startTime, notes: req.body.notes } }), "Sleep session started", 201);
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") throw new AppError(409, "SLEEP_ALREADY_ACTIVE", "This baby already has an active sleep session");
      throw error;
    }
  } catch (e) { next(e); }
});

sleepRouter.post("/babies/:babyId/sleep/stop", validate(z.object({ params: babyParams.shape.params, body: z.object({ endTime: z.coerce.date().optional() }) })), async (req, res, next) => {
  try {
    await ownedBaby(req.authUserId!, req.params.babyId);
    const active = await prisma.sleepSession.findFirst({ where: { babyId: req.params.babyId, endTime: null }, orderBy: { startTime: "desc" } });
    if (!active) return ok(res, { session: null, alreadyStopped: true }, "No active sleep session");
    const endTime = req.body.endTime ?? new Date(); ensureDateRange(active.startTime, endTime);
    const session = await prisma.sleepSession.update({ where: { id: active.id }, data: { endTime, durationMinutes: duration(active.startTime, endTime) } });
    ok(res, { session, alreadyStopped: false }, "Sleep session stopped");
  } catch (e) { next(e); }
});

sleepRouter.get("/babies/:babyId/sleep/active", validate(babyParams), async (req, res, next) => {
  try { await ownedBaby(req.authUserId!, req.params.babyId); ok(res, await prisma.sleepSession.findFirst({ where: { babyId: req.params.babyId, endTime: null } })); } catch (e) { next(e); }
});
sleepRouter.get("/babies/:babyId/sleep", validate(z.object({ params: babyParams.shape.params, query: pagination.extend({ from: z.coerce.date().optional(), to: z.coerce.date().optional() }) })), async (req, res, next) => {
  try {
    await ownedBaby(req.authUserId!, req.params.babyId); const { page, limit, from, to } = req.query as any;
    const where = { babyId: req.params.babyId, startTime: { ...(from && { gte: from }), ...(to && { lte: to }) } };
    const [items, total] = await Promise.all([prisma.sleepSession.findMany({ where, orderBy: { startTime: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.sleepSession.count({ where })]);
    ok(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
});

sleepRouter.patch("/sleep/:id", validate(z.object({ params: idParams.shape.params, body: z.object({ startTime: z.coerce.date().optional(), endTime: z.coerce.date().nullable().optional(), notes }).refine((v) => Object.keys(v).length > 0) })), async (req, res, next) => {
  try {
    const current = await prisma.sleepSession.findUnique({ where: { id: req.params.id }, include: { baby: true } });
    if (!current) throw new AppError(404, "SLEEP_NOT_FOUND", "Sleep session was not found");
    await ownedBaby(req.authUserId!, current.babyId);
    const startTime = req.body.startTime ?? current.startTime; const endTime = req.body.endTime === undefined ? current.endTime : req.body.endTime; ensureDateRange(startTime, endTime);
    if (endTime === null && await prisma.sleepSession.findFirst({ where: { babyId: current.babyId, endTime: null, NOT: { id: current.id } } })) throw new AppError(409, "SLEEP_ALREADY_ACTIVE", "This baby already has an active sleep session");
    ok(res, await prisma.sleepSession.update({ where: { id: current.id }, data: { ...req.body, durationMinutes: endTime ? duration(startTime, endTime) : null } }), "Sleep session updated");
  } catch (e) { next(e); }
});
sleepRouter.delete("/sleep/:id", validate(idParams), async (req, res, next) => {
  try { const item = await prisma.sleepSession.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, "SLEEP_NOT_FOUND", "Sleep session was not found"); await ownedBaby(req.authUserId!, item.babyId); await prisma.sleepSession.delete({ where: { id: item.id } }); ok(res, { id: item.id }, "Sleep session deleted"); } catch (e) { next(e); }
});
