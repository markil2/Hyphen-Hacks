import { existsSync, readFileSync } from "node:fs";
import { parse } from "dotenv";
import { defineConfig } from "vitest/config";

/**
 * The tests wipe and rebuild their database on every run, so they use a separate
 * Supabase project configured in .env.test — never the one in .env.
 */
const read = (file: string) => (existsSync(file) ? parse(readFileSync(file)) : {});
const testEnv = read(".env.test");
const appEnv = read(".env");

const testUrl = testEnv.TEST_DATABASE_URL;
if (!testUrl) {
  throw new Error("Set TEST_DATABASE_URL (and TEST_DIRECT_URL) in backend/.env.test — see .env.test.example. Use a separate Supabase project: the tests erase it.");
}
const sameAs = (a?: string, b?: string) => Boolean(a && b && a.trim() === b.trim());
if (sameAs(testUrl, appEnv.DATABASE_URL) || sameAs(testEnv.TEST_DIRECT_URL, appEnv.DIRECT_URL)) {
  throw new Error("TEST_DATABASE_URL points at the same database as DATABASE_URL. Refusing to run tests that would erase it.");
}

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: testUrl,
      DIRECT_URL: testEnv.TEST_DIRECT_URL || testUrl,
      SUPABASE_URL: "",
      SUPABASE_JWT_SECRET: "test-only-supabase-jwt-secret-for-signing-fake-sessions",
      SUPABASE_SERVICE_ROLE_KEY: "",
      FRONTEND_ORIGIN: "http://localhost:8081",
      DEMO_MODE: "false",
      RATE_LIMIT_MAX: "1000",
      AUTH_RATE_LIMIT_MAX: "1000",
      EMAIL_PROVIDER: "console",
      APP_BASE_URL: "http://localhost:8081",
      PRIVACY_POLICY_VERSION: "2026-10-10",
    },
  },
});
