import { Router } from "express";
import { z } from "zod";
import { ownedBaby } from "../auth";
import { prisma } from "../db";
import { ok, validate } from "../http";
import { babyParams } from "../schemas";

/**
 * Daily totals for the statistics screen, plus the last 24 hours against the
 * 24 hours before. Counts and sums of what was logged; nothing is scored.
 */
export const statsRouter = Router();

const DAY = 86_400_000;
const query = z.object({
  days: z.coerce.number().int().min(1).max(60).default(14),
  timezoneOffsetMinutes: z.coerce.number().int().min(-840).max(840).default(0),
});

statsRouter.get("/babies/:babyId/stats", validate(z.object({ params: babyParams.shape.params, query })), async (req, res, next) => {
  try {
    const baby = await ownedBaby(req.authUserId!, req.params.babyId);
    const { days, timezoneOffsetMinutes: offset } = req.query as unknown as z.infer<typeof query>;
    const now = Date.now();
    const shifted = new Date(now - offset * 60_000);
    shifted.setUTCHours(0, 0, 0, 0);
    const todayStart = shifted.getTime() + offset * 60_000;
    const from = new Date(todayStart - (days - 1) * DAY);
    const since = new Date(Math.min(from.getTime(), now - 2 * DAY));

    const [sleeps, feeds, diapers, heights, weights] = await Promise.all([
      prisma.sleepSession.findMany({ where: { babyId: baby.id, endTime: { not: null }, startTime: { gte: since } }, select: { startTime: true, endTime: true } }),
      prisma.feedingSession.findMany({ where: { babyId: baby.id, startTime: { gte: since } }, select: { startTime: true, feedingType: true, amount: true, unit: true } }),
      prisma.diaperChange.findMany({ where: { babyId: baby.id, timestamp: { gte: since } }, select: { timestamp: true, type: true } }),
      prisma.babyHeightMeasurement.findMany({ where: { babyId: baby.id }, orderBy: { measuredAt: "asc" }, select: { height: true, unit: true, measuredAt: true } }),
      prisma.babyWeightMeasurement.findMany({ where: { babyId: baby.id }, orderBy: { measuredAt: "asc" }, select: { weight: true, unit: true, measuredAt: true } }),
    ]);

    const minutes = (s: { startTime: Date; endTime: Date | null }) => Math.max(0, (s.endTime!.getTime() - s.startTime.getTime()) / 60_000);
    const daily = Array.from({ length: days }, (_, i) => {
      const start = todayStart - (days - 1 - i) * DAY;
      const inDay = (d: Date) => d.getTime() >= start && d.getTime() < start + DAY;
      return {
        date: new Date(start).toISOString(),
        sleepMinutes: Math.round(sleeps.filter((s) => inDay(s.startTime)).reduce((sum, s) => sum + minutes(s), 0)),
        sleeps: sleeps.filter((s) => inDay(s.startTime)).length,
        feeds: feeds.filter((f) => inDay(f.startTime)).length,
        solids: feeds.filter((f) => inDay(f.startTime) && f.feedingType === "solids").length,
        diapers: diapers.filter((d) => inDay(d.timestamp)).length,
        dirty: diapers.filter((d) => inDay(d.timestamp) && d.type !== "wet").length,
      };
    });

    const window = (a: number, b: number) => {
      const inW = (d: Date) => d.getTime() >= a && d.getTime() < b;
      return {
        sleepMinutes: Math.round(sleeps.filter((s) => inW(s.startTime)).reduce((sum, s) => sum + minutes(s), 0)),
        feeds: feeds.filter((f) => inW(f.startTime)).length,
        diapers: diapers.filter((d) => inW(d.timestamp)).length,
      };
    };

    ok(res, {
      daily,
      last24h: window(now - DAY, now),
      previous24h: window(now - 2 * DAY, now - DAY),
      heights: heights.map((h) => ({ height: h.height, unit: h.unit, measuredAt: h.measuredAt })),
      weights: weights.map((w) => ({ weight: w.weight, unit: w.unit, measuredAt: w.measuredAt })),
    });
  } catch (e) { next(e); }
});
