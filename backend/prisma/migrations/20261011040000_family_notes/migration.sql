-- CreateTable
CREATE TABLE "FamilyNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'cream',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FamilyNote_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FamilyNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Baby" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "familyId" TEXT,
    "name" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "sexAtBirth" TEXT,
    "initialWeight" REAL,
    "weightUnit" TEXT,
    "initialHeight" REAL,
    "heightUnit" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Baby_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Baby_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Baby" ("birthDate", "createdAt", "familyId", "heightUnit", "id", "initialHeight", "initialWeight", "name", "sexAtBirth", "updatedAt", "userId", "weightUnit") SELECT "birthDate", "createdAt", "familyId", "heightUnit", "id", "initialHeight", "initialWeight", "name", "sexAtBirth", "updatedAt", "userId", "weightUnit" FROM "Baby";
DROP TABLE "Baby";
ALTER TABLE "new_Baby" RENAME TO "Baby";
CREATE INDEX "Baby_userId_idx" ON "Baby"("userId");
CREATE INDEX "Baby_familyId_idx" ON "Baby"("familyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FamilyNote_familyId_createdAt_idx" ON "FamilyNote"("familyId", "createdAt");
