import { z } from "zod";

export const idParams = z.object({ params: z.object({ id: z.string().min(1) }) });
export const babyParams = z.object({ params: z.object({ babyId: z.string().min(1) }) });
export const date = z.coerce.date();
export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const feedingTypes = ["breast_milk", "formula", "solids"] as const;
export const feedingUnits = ["ml", "oz", "g", "serving"] as const;
export const questionCategories = ["feeding", "sleep", "development", "health", "general"] as const;

export function ensureDateRange(start: Date, end?: Date | null) {
  if (end && end < start) throw new z.ZodError([{ code: "custom", path: ["endTime"], message: "endTime cannot precede startTime" }]);
}
