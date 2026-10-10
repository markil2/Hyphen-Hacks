import { Router } from "express";
import { z } from "zod";
import { ownedBaby } from "../auth";
import { prisma } from "../db";
import { ok, validate } from "../http";
import { babyParams } from "../schemas";

export const dashboardRouter = Router();
const query = z.object({ timezoneOffsetMinutes: z.coerce.number().int().min(-840).max(840).default(0) });
function dayBounds(offset: number) { const shifted = new Date(Date.now() - offset * 60000); shifted.setUTCHours(0, 0, 0, 0); const start = new Date(shifted.getTime() + offset * 60000); return { start, end: new Date(start.getTime() + 86400000) }; }

dashboardRouter.get("/babies/:babyId/dashboard", validate(z.object({ params: babyParams.shape.params, query })), async (req, res, next) => {
  try {
    const baby = await ownedBaby(req.authUserId!, req.params.babyId); const offset = Number(req.query.timezoneOffsetMinutes); const { start, end } = dayBounds(offset);
    const [latestFeeding, latestSleep, activeSleep, sleepToday, feedingsToday, recentDiapers, recentQuestions, latestHeight, recentMilestones, recentHealth] = await Promise.all([
      prisma.feedingSession.findFirst({ where: { babyId: baby.id }, orderBy: { startTime: "desc" } }),
      prisma.sleepSession.findFirst({ where: { babyId: baby.id }, orderBy: { startTime: "desc" } }),
      prisma.sleepSession.findFirst({ where: { babyId: baby.id, endTime: null } }),
      prisma.sleepSession.findMany({ where: { babyId: baby.id, startTime: { gte: start, lt: end }, endTime: { not: null } } }),
      prisma.feedingSession.findMany({ where: { babyId: baby.id, startTime: { gte: start, lt: end } }, orderBy: { startTime: "desc" } }),
      prisma.diaperChange.findMany({ where: { babyId: baby.id }, orderBy: { timestamp: "desc" }, take: 5 }),
      prisma.parentQuestion.findMany({ where: { babyId: baby.id, userId: req.authUserId }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.babyHeightMeasurement.findFirst({ where: { babyId: baby.id }, orderBy: { measuredAt: "desc" } }),
      prisma.developmentalMilestone.findMany({ where: { babyId: baby.id }, orderBy: { achievedAt: "desc" }, take: 5 }),
      prisma.babyHealthObservation.findMany({ where: { babyId: baby.id }, orderBy: { observedAt: "desc" }, take: 5 }),
    ]);
    const todaySleepMinutes = sleepToday.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
    ok(res, { baby, latestFeeding, latestSleep, activeSleep, latestHeight, todaySleepMinutes, feedingsToday, recentDiapers, recentQuestions, recentMilestones, recentHealth, day: { start, end, timezoneOffsetMinutes: offset } });
  } catch (e) { next(e); }
});

dashboardRouter.get("/babies/:babyId/timeline", validate(z.object({ params: babyParams.shape.params, query: z.object({ limit: z.coerce.number().int().min(1).max(100).default(30) }) })), async (req, res, next) => {
  try {
    const baby = await ownedBaby(req.authUserId!, req.params.babyId); const take = Number(req.query.limit);
    const [sleep, feedings, diapers, questions, heights, milestones, health] = await Promise.all([
      prisma.sleepSession.findMany({ where: { babyId: baby.id }, orderBy: { startTime: "desc" }, take }),
      prisma.feedingSession.findMany({ where: { babyId: baby.id }, orderBy: { startTime: "desc" }, take }),
      prisma.diaperChange.findMany({ where: { babyId: baby.id }, orderBy: { timestamp: "desc" }, take }),
      prisma.parentQuestion.findMany({ where: { babyId: baby.id, userId: req.authUserId }, orderBy: { createdAt: "desc" }, take }),
      prisma.babyHeightMeasurement.findMany({ where: { babyId: baby.id }, orderBy: { measuredAt: "desc" }, take }),
      prisma.developmentalMilestone.findMany({ where: { babyId: baby.id }, orderBy: { achievedAt: "desc" }, take }),
      prisma.babyHealthObservation.findMany({ where: { babyId: baby.id }, orderBy: { observedAt: "desc" }, take }),
    ]);
    const events = [
      ...sleep.map((data) => ({ type: "sleep", timestamp: data.startTime, data })),
      ...feedings.map((data) => ({ type: "feeding", timestamp: data.startTime, data })),
      ...diapers.map((data) => ({ type: "diaper", timestamp: data.timestamp, data })),
      ...questions.map((data) => ({ type: "question", timestamp: data.createdAt, data })),
      ...heights.map((data) => ({ type: "height", timestamp: data.measuredAt, data })),
      ...milestones.map((data) => ({ type: "milestone", timestamp: data.achievedAt, data })),
      ...health.map((data) => ({ type: "health", timestamp: data.observedAt, data })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, take);
    ok(res, events);
  } catch (e) { next(e); }
});
