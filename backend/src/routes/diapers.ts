import { Router } from "express";
import { z } from "zod";
import { ownedBaby } from "../auth";
import { prisma } from "../db";
import { AppError, ok, validate } from "../http";
import { babyParams, idParams, pagination } from "../schemas";

export const diapersRouter = Router();
const body = z.object({ type: z.enum(["wet", "dirty", "mixed"]), timestamp: z.coerce.date().optional(), notes: z.string().trim().max(1000).nullable().optional() });
diapersRouter.post("/babies/:babyId/diapers", validate(z.object({ params: babyParams.shape.params, body })), async (req, res, next) => { try { await ownedBaby(req.authUserId!, req.params.babyId); ok(res, await prisma.diaperChange.create({ data: { ...req.body, timestamp: req.body.timestamp ?? new Date(), babyId: req.params.babyId } }), "Diaper change recorded", 201); } catch (e) { next(e); } });
diapersRouter.get("/babies/:babyId/diapers", validate(z.object({ params: babyParams.shape.params, query: pagination })), async (req, res, next) => { try { await ownedBaby(req.authUserId!, req.params.babyId); const { page, limit } = req.query as any; const [items, total] = await Promise.all([prisma.diaperChange.findMany({ where: { babyId: req.params.babyId }, orderBy: { timestamp: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.diaperChange.count({ where: { babyId: req.params.babyId } })]); ok(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }); } catch (e) { next(e); } });
diapersRouter.patch("/diapers/:id", validate(z.object({ params: idParams.shape.params, body: body.partial().refine((v) => Object.keys(v).length > 0) })), async (req, res, next) => { try { const item = await prisma.diaperChange.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, "DIAPER_NOT_FOUND", "Diaper change was not found"); await ownedBaby(req.authUserId!, item.babyId); ok(res, await prisma.diaperChange.update({ where: { id: item.id }, data: req.body }), "Diaper change updated"); } catch (e) { next(e); } });
diapersRouter.delete("/diapers/:id", validate(idParams), async (req, res, next) => { try { const item = await prisma.diaperChange.findUnique({ where: { id: req.params.id } }); if (!item) throw new AppError(404, "DIAPER_NOT_FOUND", "Diaper change was not found"); await ownedBaby(req.authUserId!, item.babyId); await prisma.diaperChange.delete({ where: { id: item.id } }); ok(res, { id: item.id }, "Diaper change deleted"); } catch (e) { next(e); } });
