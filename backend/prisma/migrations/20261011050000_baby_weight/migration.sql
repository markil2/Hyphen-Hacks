-- CreateTable
CREATE TABLE "BabyWeightMeasurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "babyId" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "measuredAt" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BabyWeightMeasurement_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BabyWeightMeasurement_babyId_measuredAt_idx" ON "BabyWeightMeasurement"("babyId", "measuredAt");

