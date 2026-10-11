import { Router } from "express";
import { z } from "zod";
import { askClaude } from "../ai";
import { ownedBaby } from "../auth";
import { prisma } from "../db";
import { ok, validate } from "../http";
import { babyParams } from "../schemas";

/**
 * A one-or-two sentence update about the baby for the nursery console, written
 * from the family's own logs. Claude phrases it when a key is set; otherwise the
 * same facts are joined into a plain sentence. Neither reads meaning into the data.
 */
export const summaryRouter = Router();

const HOUR = 3600_000;
const cache = new Map<string, { key: string; at: number; summary: string; source: "ai" | "logs" }>();

const ago = (d: Date, now: number) => {
  const m = Math.round((now - d.getTime()) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

const FEED: Record<string, string> = { breast_milk: "breast milk", formula: "formula", solids: "solids" };

const SYSTEM = `You write a short, warm status line for a baby-care app's home screen.
- Use only the facts given. Do not add, infer, or estimate anything.
- One or two short sentences, max 160 characters total. Plain words, no emoji, no exclamation marks.
- Never judge whether amounts, timings, temperatures, or growth are normal, good, low, high, or concerning, and never give advice.
- If there are no facts, say nothing has been logged yet today.
Reply with the sentence only.`;

summaryRouter.get("/babies/:babyId/summary", validate(babyParams), async (req, res, next) => {
  try {
    const baby = await ownedBaby(req.authUserId!, req.params.babyId);
    const now = Date.now();
    const dayStart = new Date(now - 24 * HOUR);
    const prevStart = new Date(now - 48 * HOUR);
    const [prevFeeds, prevDiapers, sleeps48] = await Promise.all([
      prisma.feedingSession.count({ where: { babyId: baby.id, startTime: { gte: prevStart, lt: dayStart } } }),
      prisma.diaperChange.count({ where: { babyId: baby.id, timestamp: { gte: prevStart, lt: dayStart } } }),
      prisma.sleepSession.findMany({ where: { babyId: baby.id, endTime: { not: null }, startTime: { gte: prevStart } }, select: { startTime: true, endTime: true } }),
    ]);
    const sleepMin = (a: number, b: number) =>
      Math.round(sleeps48.filter((x) => x.startTime.getTime() >= a && x.startTime.getTime() < b).reduce((sum, x) => sum + (x.endTime!.getTime() - x.startTime.getTime()) / 60_000, 0));
    const sleepNow = sleepMin(dayStart.getTime(), now);
    const sleepBefore = sleepMin(prevStart.getTime(), dayStart.getTime());
    const change = (a: number, b: number, unit: string) => (a === b ? `same ${unit} as the day before` : `${Math.abs(a - b)} ${a > b ? "more" : "fewer"} ${unit} than the day before`);
    const [feed, diaper, sleep, feeds, diapers, height, health, milestone] = await Promise.all([
      prisma.feedingSession.findFirst({ where: { babyId: baby.id }, orderBy: { startTime: "desc" } }),
      prisma.diaperChange.findFirst({ where: { babyId: baby.id }, orderBy: { timestamp: "desc" } }),
      prisma.sleepSession.findFirst({ where: { babyId: baby.id, endTime: { not: null } }, orderBy: { endTime: "desc" } }),
      prisma.feedingSession.count({ where: { babyId: baby.id, startTime: { gte: dayStart } } }),
      prisma.diaperChange.count({ where: { babyId: baby.id, timestamp: { gte: dayStart } } }),
      prisma.babyHeightMeasurement.findFirst({ where: { babyId: baby.id }, orderBy: { measuredAt: "desc" } }),
      prisma.babyHealthObservation.findFirst({ where: { babyId: baby.id, observedAt: { gte: dayStart } }, orderBy: { observedAt: "desc" } }),
      prisma.developmentalMilestone.findFirst({ where: { babyId: baby.id }, orderBy: { achievedAt: "desc" } }),
    ]);

    const facts: string[] = [];
    if (feed) facts.push(`last fed ${ago(feed.startTime, now)} (${FEED[feed.feedingType] ?? feed.feedingType})`);
    if (feeds || prevFeeds) facts.push(`${feeds} feed${feeds === 1 ? "" : "s"} in the last 24 h (${change(feeds, prevFeeds, "feeds")})`);
    const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`);
    if (sleepNow || sleepBefore) facts.push(`${dur(sleepNow)} of logged sleep in the last 24 h (${sleepNow === sleepBefore ? "same as the day before" : `${dur(Math.abs(sleepNow - sleepBefore))} ${sleepNow > sleepBefore ? "more" : "less"} than the day before`})`);
    if (sleep?.endTime) facts.push(`woke ${ago(sleep.endTime, now)}`);
    if (diaper) facts.push(`last change ${ago(diaper.timestamp, now)}`);
    if (diapers || prevDiapers) facts.push(`${diapers} change${diapers === 1 ? "" : "s"} in the last 24 h (${change(diapers, prevDiapers, "changes")})`);
    if (health) facts.push(`a ${health.type} note was logged ${ago(health.observedAt, now)}`);
    if (milestone && now - milestone.achievedAt.getTime() < 7 * 24 * HOUR) facts.push(`new milestone noted: ${milestone.title}`);
    if (height && now - height.measuredAt.getTime() < 7 * 24 * HOUR) facts.push(`measured ${height.height} ${height.unit}`);

    const plain = facts.length ? `${baby.name}: ${facts.slice(0, 2).join(", ")}.` : `Nothing logged for ${baby.name} in the last day yet.`;
    // Reuse the last phrasing while nothing has changed, so the console doesn't spend a call per glance.
    const key = facts.join("|").replace(/\d+ (min|h|d) ago|just now/g, "");
    const hit = cache.get(baby.id);
    if (hit && hit.key === key && now - hit.at < 20 * 60_000) return ok(res, { summary: hit.summary, source: hit.source, facts });

    const ai = facts.length ? await askClaude(SYSTEM, `Baby's name: ${baby.name}\nFacts: ${facts.join("; ")}`, 200) : null;
    const summary = ai && ai.length <= 220 ? ai : plain;
    const source = ai && ai.length <= 220 ? "ai" : "logs";
    cache.set(baby.id, { key, at: now, summary, source });
    ok(res, { summary, source, facts });
  } catch (e) { next(e); }
});
