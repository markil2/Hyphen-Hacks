import "dotenv/config";
import { z } from "zod";

const optional = z.string().trim().optional().transform((value) => value || undefined);

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  // Supabase Postgres: pooled URL for the running API, direct URL for migrations (see .env.example).
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (Supabase pooled connection string)"),
  DIRECT_URL: optional,
  // Supabase Auth. Access tokens are verified against the project's JWKS (asymmetric keys);
  // projects still on the legacy shared secret can set SUPABASE_JWT_SECRET instead.
  SUPABASE_URL: optional.pipe(z.string().url().optional()),
  SUPABASE_JWT_SECRET: optional,
  // Server-only. Used solely to delete the Supabase Auth user when someone deletes their account.
  SUPABASE_SERVICE_ROLE_KEY: optional,
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:8081"),
  DEMO_MODE: z.string().default("false").transform((value) => value === "true"),
  DEMO_EMAIL: z.string().email().default("demo@nurture.local"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  EMAIL_PROVIDER: z.enum(["console", "resend"]).default("console"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Nurture <noreply@example.com>"),
  APP_BASE_URL: z.string().url().default("http://localhost:8081"),
  PRIVACY_POLICY_VERSION: z.string().default("2026-10-10"),
});

export const config = schema.parse(process.env);

export const supabaseIssuer = config.SUPABASE_URL ? `${config.SUPABASE_URL.replace(/\/$/, "")}/auth/v1` : undefined;
