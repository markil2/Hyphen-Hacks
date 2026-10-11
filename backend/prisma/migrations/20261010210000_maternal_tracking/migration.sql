CREATE TABLE "MaternalProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trackingMode" TEXT NOT NULL DEFAULT 'menstrual',
    "lastPeriodStartDate" DATETIME,
    "averageCycleLength" INTEGER,
    "averagePeriodDays" INTEGER,
    "estimatedDueDate" DATETIME,
    "multiplesCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaternalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "MenstrualDailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maternalProfileId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "bleedingIntensity" TEXT,
    "basalTemperature" REAL,
    "temperatureUnit" TEXT,
    "cervicalMucus" TEXT,
    "lhTestResult" TEXT,
    "lhPhotoReference" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenstrualDailyLog_maternalProfileId_fkey" FOREIGN KEY ("maternalProfileId") REFERENCES "MaternalProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "PregnancyDailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maternalProfileId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "nauseaVomiting" TEXT,
    "fatigue" TEXT,
    "brainFog" TEXT,
    "mood" TEXT,
    "anxiety" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PregnancyDailyLog_maternalProfileId_fkey" FOREIGN KEY ("maternalProfileId") REFERENCES "MaternalProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "HealthMeasurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maternalProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL,
    "unit" TEXT,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "context" TEXT,
    "measuredAt" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthMeasurement_maternalProfileId_fkey" FOREIGN KEY ("maternalProfileId") REFERENCES "MaternalProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "HormoneMeasurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maternalProfileId" TEXT NOT NULL,
    "hormone" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "measuredAt" DATETIME NOT NULL,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HormoneMeasurement_maternalProfileId_fkey" FOREIGN KEY ("maternalProfileId") REFERENCES "MaternalProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "MaternalProfile_userId_key" ON "MaternalProfile"("userId");
CREATE UNIQUE INDEX "MenstrualDailyLog_maternalProfileId_date_key" ON "MenstrualDailyLog"("maternalProfileId", "date");
CREATE INDEX "MenstrualDailyLog_maternalProfileId_date_idx" ON "MenstrualDailyLog"("maternalProfileId", "date");
CREATE UNIQUE INDEX "PregnancyDailyLog_maternalProfileId_date_key" ON "PregnancyDailyLog"("maternalProfileId", "date");
CREATE INDEX "PregnancyDailyLog_maternalProfileId_date_idx" ON "PregnancyDailyLog"("maternalProfileId", "date");
CREATE INDEX "HealthMeasurement_maternalProfileId_type_measuredAt_idx" ON "HealthMeasurement"("maternalProfileId", "type", "measuredAt");
CREATE INDEX "HormoneMeasurement_maternalProfileId_hormone_measuredAt_idx" ON "HormoneMeasurement"("maternalProfileId", "hormone", "measuredAt");
