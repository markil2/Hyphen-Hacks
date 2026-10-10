import { execFileSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const database = resolve(process.cwd(), "prisma/test.db");
if (existsSync(database)) unlinkSync(database);
execFileSync("sqlite3", [database, `.read '${resolve(process.cwd(), "prisma/migrations/20261010190000_init/migration.sql")}'`]);
execFileSync("sqlite3", [database, `.read '${resolve(process.cwd(), "prisma/migrations/20261010210000_maternal_tracking/migration.sql")}'`]);
execFileSync("sqlite3", [database, `.read '${resolve(process.cwd(), "prisma/migrations/20261010230000_expert_directory/migration.sql")}'`]);
execFileSync("sqlite3", [database, `.read '${resolve(process.cwd(), "prisma/migrations/20261011000000_baby_height_tracking/migration.sql")}'`]);
execFileSync("sqlite3", [database, `.read '${resolve(process.cwd(), "prisma/migrations/20261011020000_accounts_families_tracking/migration.sql")}'`]);
execFileSync("sqlite3", [database, `.read '${resolve(process.cwd(), "prisma/migrations/20261011030000_active_sleep_constraint/migration.sql")}'`]);
