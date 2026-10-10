import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "file:./test.db",
      JWT_SECRET: "test-secret-long-enough-for-validation",
      FRONTEND_ORIGIN: "http://localhost:5173",
      DEMO_MODE: "false",
      RATE_LIMIT_MAX: "1000",
      EMAIL_PROVIDER: "console",
      APP_BASE_URL: "http://localhost:5173",
      PRIVACY_POLICY_VERSION: "2026-10-10"
    }
  }
});
