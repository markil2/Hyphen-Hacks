import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_SECRET: z.string().min(16).default("development-only-secret-change-me"),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
  DEMO_MODE: z.string().default("true").transform((value) => value === "true"),
  DEMO_EMAIL: z.string().email().default("demo@nurture.local"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  EMAIL_PROVIDER: z.enum(["console", "resend"]).default("console"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Nurture <noreply@example.com>"),
  APP_BASE_URL: z.string().url().default("http://localhost:5173"),
  PRIVACY_POLICY_VERSION: z.string().default("2026-10-10"),
});

export const config = schema.parse(process.env);
