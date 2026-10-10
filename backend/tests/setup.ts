import { execFileSync } from "node:child_process";

// Rebuild the test database from the checked-in migrations before the suite runs.
// vitest.config.ts has already confirmed DATABASE_URL is the separate test project.
execFileSync("npx", ["prisma", "migrate", "reset", "--force", "--skip-seed", "--skip-generate"], {
  stdio: "inherit",
  env: process.env,
});
