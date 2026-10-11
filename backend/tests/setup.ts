import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const database = resolve(process.cwd(), "prisma/test.db");
if (existsSync(database)) unlinkSync(database);
const migrations = resolve(process.cwd(), "prisma/migrations");
for (const dir of readdirSync(migrations, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  execFileSync("sqlite3", [database, `.read '${resolve(migrations, dir, "migration.sql")}'`]);
}
