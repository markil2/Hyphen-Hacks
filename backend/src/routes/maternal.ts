import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { AppError, ok, validate } from "../http";
import { idParams, pagination } from "../schemas";

export const maternalRouter = Router();
const safetyNotice = "Tracking records are informational and are not diagnosis, treatment, emergency monitoring, or a substitute for qualified medical care.";
const dateOnly = z.string().date().transform((value) => new Date(`${value}T00:00:00.000Z`));
const optionalNote = z.string().trim().max(2000).nullable().optional();

async function profileFor(userId: string) {
  const profile = await prisma.maternalProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError(404, "MATERNAL_PROFILE_NOT_FOUND", "Set up maternal tracking before creating logs");
  return profile;
}

maternalRouter.put("/maternal/profile", validate(z.object({ body: z.object({
  trackingMode: z.enum(["menstrual", "pregnancy", "postpartum"]),
  lastPeriodStartDate: z.coerce.date().nullable().optional(),
  averageCycleLength: z.coerce.number().int().min(15).max(60).nullable().optional(),
  averagePeriodDays: z.coerce.number().int().min(1).max(15).nullable().optional(),
  estimatedDueDate: z.coerce.date().nullable().optional(),
  multiplesCount: z.coerce.number().int().min(1).max(5).default(1),
}).superRefine((value, ctx) => {
  if (value.trackingMode === "menstrual" && !value.lastPeriodStartDate) ctx.addIssue({ code: "custom", path: ["lastPeriodStartDate"], message: "Required for menstrual calibration" });
  if (value.trackingMode === "menstrual" && !value.averageCycleLength) ctx.addIssue({ code: "custom", path: ["averageCycleLength"], message: "Required for menstrual calibration" });
  if (value.trackingMode === "menstrual" && !value.averagePeriodDays) ctx.addIssue({ code: "custom", path: ["averagePeriodDays"], message: "Required for menstrual calibration" });
  if (value.trackingMode === "pregnancy" && !value.estimatedDueDate) ctx.addIssue({ code: "custom", path: ["estimatedDueDate"], message: "Required for pregnancy setup" });
}) })), async (req, res, next) => {
  try {
    const profile = await prisma.maternalProfile.upsert({ where: { userId: req.authUserId! }, create: { ...req.body, userId: req.authUserId! }, update: req.body });
    ok(res, { profile, safetyNotice, multiplesNotice: "Multiples count is recorded as context only. The API does not estimate, alter, or interpret hormone levels from it." }, "Maternal tracking setup saved");
  } catch (e) { next(e); }
});
maternalRouter.get("/maternal/profile", async (req, res, next) => { try { ok(res, { profile: await profileFor(req.authUserId!), safetyNotice }); } catch (e) { next(e); } });

const menstrualBody = z.object({
  date: dateOnly,
  bleedingIntensity: z.enum(["none", "spotting", "light", "medium", "heavy"]).nullable().optional(),
  basalTemperature: z.coerce.number().min(20).max(120).nullable().optional(),
  temperatureUnit: z.enum(["C", "F"]).nullable().optional(),
  cervicalMucus: z.enum(["dry", "sticky", "creamy", "watery", "egg_white", "other"]).nullable().optional(),
  lhTestResult: z.enum(["not_taken", "negative", "positive", "unclear"]).nullable().optional(),
  lhPhotoReference: z.string().trim().max(500).nullable().optional(),
  notes: optionalNote,
}).superRefine((value, ctx) => {
  if (value.basalTemperature != null && !value.temperatureUnit) ctx.addIssue({ code: "custom", path: ["temperatureUnit"], message: "Required with basalTemperature" });
  if (value.temperatureUnit === "F" && value.basalTemperature != null && (value.basalTemperature < 80 || value.basalTemperature > 115)) ctx.addIssue({ code: "custom", path: ["basalTemperature"], message: "Fahrenheit temperature appears invalid" });
  if (value.temperatureUnit === "C" && value.basalTemperature != null && (value.basalTemperature < 30 || value.basalTemperature > 45)) ctx.addIssue({ code: "custom", path: ["basalTemperature"], message: "Celsius temperature appears invalid" });
});
maternalRouter.put("/maternal/menstrual/daily", validate(z.object({ body: menstrualBody })), async (req, res, next) => {
  try { const profile = await profileFor(req.authUserId!); if (profile.trackingMode !== "menstrual") throw new AppError(409, "WRONG_TRACKING_MODE", "The maternal profile is not in menstrual mode"); const { date, ...data } = req.body; const log = await prisma.menstrualDailyLog.upsert({ where: { maternalProfileId_date: { maternalProfileId: profile.id, date } }, create: { ...data, date, maternalProfileId: profile.id }, update: data }); ok(res, { log, safetyNotice }, "Menstrual daily log saved"); } catch (e) { next(e); }
});
maternalRouter.get("/maternal/menstrual/daily", validate(z.object({ query: pagination.extend({ from: z.coerce.date().optional(), to: z.coerce.date().optional() }) })), async (req, res, next) => {
  try { const profile = await profileFor(req.authUserId!); const { page, limit, from, to } = req.query as any; const where = { maternalProfileId: profile.id, date: { ...(from && { gte: from }), ...(to && { lte: to }) } }; const [items, total] = await Promise.all([prisma.menstrualDailyLog.findMany({ where, orderBy: { date: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.menstrualDailyLog.count({ where })]); ok(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, safetyNotice }); } catch (e) { next(e); }
});

const severity = z.enum(["none", "mild", "moderate", "severe"]);
const pregnancyBody = z.object({ date: dateOnly, nauseaVomiting: z.enum(["none", "nausea", "vomiting"]).nullable().optional(), fatigue: severity.nullable().optional(), brainFog: severity.nullable().optional(), mood: z.enum(["very_low", "low", "neutral", "good", "very_good", "mixed"]).nullable().optional(), anxiety: severity.nullable().optional(), notes: optionalNote });
maternalRouter.put("/maternal/pregnancy/daily", validate(z.object({ body: pregnancyBody })), async (req, res, next) => {
  try { const profile = await profileFor(req.authUserId!); if (profile.trackingMode !== "pregnancy") throw new AppError(409, "WRONG_TRACKING_MODE", "The maternal profile is not in pregnancy mode"); const { date, ...data } = req.body; const log = await prisma.pregnancyDailyLog.upsert({ where: { maternalProfileId_date: { maternalProfileId: profile.id, date } }, create: { ...data, date, maternalProfileId: profile.id }, update: data }); ok(res, { log, safetyNotice, supportNotice: "Mood and anxiety entries are private tracking records. This API does not provide therapy or crisis services." }, "Pregnancy daily log saved"); } catch (e) { next(e); }
});
maternalRouter.get("/maternal/pregnancy/daily", validate(z.object({ query: pagination.extend({ from: z.coerce.date().optional(), to: z.coerce.date().optional() }) })), async (req, res, next) => {
  try { const profile = await profileFor(req.authUserId!); const { page, limit, from, to } = req.query as any; const where = { maternalProfileId: profile.id, date: { ...(from && { gte: from }), ...(to && { lte: to }) } }; const [items, total] = await Promise.all([prisma.pregnancyDailyLog.findMany({ where, orderBy: { date: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.pregnancyDailyLog.count({ where })]); ok(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, safetyNotice }); } catch (e) { next(e); }
});

const healthBody = z.object({ type: z.enum(["blood_pressure", "weight", "blood_glucose"]), value: z.coerce.number().positive().nullable().optional(), unit: z.enum(["kg", "lb", "mg/dL", "mmol/L"]).nullable().optional(), systolic: z.coerce.number().int().positive().nullable().optional(), diastolic: z.coerce.number().int().positive().nullable().optional(), context: z.enum(["unspecified", "fasting", "before_meal", "after_meal", "resting"]).default("unspecified"), measuredAt: z.coerce.date().default(() => new Date()), notes: optionalNote }).superRefine((value, ctx) => {
  if (value.type === "blood_pressure" && (!value.systolic || !value.diastolic)) ctx.addIssue({ code: "custom", path: ["systolic"], message: "systolic and diastolic are required for blood pressure" });
  if (value.type !== "blood_pressure" && (value.value == null || !value.unit)) ctx.addIssue({ code: "custom", path: ["value"], message: "value and unit are required" });
  if (value.type === "weight" && value.unit && !["kg", "lb"].includes(value.unit)) ctx.addIssue({ code: "custom", path: ["unit"], message: "Weight unit must be kg or lb" });
  if (value.type === "blood_glucose" && value.unit && !["mg/dL", "mmol/L"].includes(value.unit)) ctx.addIssue({ code: "custom", path: ["unit"], message: "Blood glucose unit must be mg/dL or mmol/L" });
});
maternalRouter.post("/maternal/health", validate(z.object({ body: healthBody })), async (req, res, next) => { try { const profile = await profileFor(req.authUserId!); const measurement = await prisma.healthMeasurement.create({ data: { ...req.body, maternalProfileId: profile.id } }); ok(res, { measurement, safetyNotice }, "Health measurement recorded", 201); } catch (e) { next(e); } });
maternalRouter.get("/maternal/health", validate(z.object({ query: pagination.extend({ type: z.enum(["blood_pressure", "weight", "blood_glucose"]).optional() }) })), async (req, res, next) => { try { const profile = await profileFor(req.authUserId!); const { page, limit, type } = req.query as any; const where = { maternalProfileId: profile.id, ...(type && { type }) }; const [items, total] = await Promise.all([prisma.healthMeasurement.findMany({ where, orderBy: { measuredAt: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.healthMeasurement.count({ where })]); ok(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, safetyNotice }); } catch (e) { next(e); } });
maternalRouter.delete("/maternal/health/:id", validate(idParams), async (req, res, next) => { try { const profile = await profileFor(req.authUserId!); const item = await prisma.healthMeasurement.findFirst({ where: { id: req.params.id, maternalProfileId: profile.id } }); if (!item) throw new AppError(404, "MEASUREMENT_NOT_FOUND", "Health measurement was not found"); await prisma.healthMeasurement.delete({ where: { id: item.id } }); ok(res, { id: item.id }, "Health measurement deleted"); } catch (e) { next(e); } });

const hormoneBody = z.object({ hormone: z.enum(["lh", "hcg", "estrogen", "progesterone", "fsh", "other"]), value: z.coerce.number().nonnegative(), unit: z.string().trim().min(1).max(50), measuredAt: z.coerce.date().default(() => new Date()), source: z.enum(["lab", "home_test", "manual_entry", "other"]).default("manual_entry"), notes: optionalNote });
maternalRouter.post("/maternal/hormones", validate(z.object({ body: hormoneBody })), async (req, res, next) => { try { const profile = await profileFor(req.authUserId!); const measurement = await prisma.hormoneMeasurement.create({ data: { ...req.body, maternalProfileId: profile.id } }); ok(res, { measurement, safetyNotice, interpretationNotice: "Values are stored exactly as entered. The API does not calculate expected ranges or adjust values for multiples." }, "Hormone measurement recorded", 201); } catch (e) { next(e); } });
maternalRouter.get("/maternal/hormones", validate(z.object({ query: pagination.extend({ hormone: z.enum(["lh", "hcg", "estrogen", "progesterone", "fsh", "other"]).optional() }) })), async (req, res, next) => { try { const profile = await profileFor(req.authUserId!); const { page, limit, hormone } = req.query as any; const where = { maternalProfileId: profile.id, ...(hormone && { hormone }) }; const [items, total] = await Promise.all([prisma.hormoneMeasurement.findMany({ where, orderBy: { measuredAt: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.hormoneMeasurement.count({ where })]); ok(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, safetyNotice }); } catch (e) { next(e); } });
maternalRouter.delete("/maternal/hormones/:id", validate(idParams), async (req, res, next) => { try { const profile = await profileFor(req.authUserId!); const item = await prisma.hormoneMeasurement.findFirst({ where: { id: req.params.id, maternalProfileId: profile.id } }); if (!item) throw new AppError(404, "MEASUREMENT_NOT_FOUND", "Hormone measurement was not found"); await prisma.hormoneMeasurement.delete({ where: { id: item.id } }); ok(res, { id: item.id }, "Hormone measurement deleted"); } catch (e) { next(e); } });
