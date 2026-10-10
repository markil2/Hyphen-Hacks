ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "deletedAt" DATETIME;
CREATE TABLE "Family" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE TABLE "FamilyMembership" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'parent',
  "status" TEXT NOT NULL DEFAULT 'active',
  "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FamilyMembership_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FamilyMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "FamilyInvitation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'parent',
  "tokenHash" TEXT NOT NULL,
  "invitedByUserId" TEXT NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "acceptedAt" DATETIME,
  "revokedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FamilyInvitation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "AccountEmailToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "usedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountEmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "PrivacyConsent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "policyVersion" TEXT NOT NULL,
  "acceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PrivacyConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
ALTER TABLE "Baby" ADD COLUMN "familyId" TEXT REFERENCES "Family"("id") ON DELETE SET NULL;
ALTER TABLE "Baby" ADD COLUMN "sexAtBirth" TEXT;
ALTER TABLE "Baby" ADD COLUMN "initialWeight" REAL;
ALTER TABLE "Baby" ADD COLUMN "weightUnit" TEXT;
ALTER TABLE "Baby" ADD COLUMN "initialHeight" REAL;
ALTER TABLE "Baby" ADD COLUMN "heightUnit" TEXT;
ALTER TABLE "FeedingSession" ADD COLUMN "feedingMethod" TEXT;
ALTER TABLE "FeedingSession" ADD COLUMN "milkType" TEXT;
ALTER TABLE "FeedingSession" ADD COLUMN "foodDescription" TEXT;
CREATE TABLE "DevelopmentalMilestone" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "babyId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "achievedAt" DATETIME NOT NULL,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DevelopmentalMilestone_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "BabyHealthObservation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "babyId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "value" REAL,
  "unit" TEXT,
  "severity" TEXT,
  "notes" TEXT,
  "observedAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BabyHealthObservation_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "FamilyMembership_familyId_userId_key" ON "FamilyMembership"("familyId", "userId");
CREATE INDEX "FamilyMembership_userId_status_idx" ON "FamilyMembership"("userId", "status");
CREATE UNIQUE INDEX "FamilyInvitation_tokenHash_key" ON "FamilyInvitation"("tokenHash");
CREATE INDEX "FamilyInvitation_email_expiresAt_idx" ON "FamilyInvitation"("email", "expiresAt");
CREATE INDEX "FamilyInvitation_familyId_idx" ON "FamilyInvitation"("familyId");
CREATE UNIQUE INDEX "AccountEmailToken_tokenHash_key" ON "AccountEmailToken"("tokenHash");
CREATE INDEX "AccountEmailToken_userId_type_expiresAt_idx" ON "AccountEmailToken"("userId", "type", "expiresAt");
CREATE UNIQUE INDEX "PrivacyConsent_userId_policyVersion_key" ON "PrivacyConsent"("userId", "policyVersion");
CREATE INDEX "Baby_familyId_idx" ON "Baby"("familyId");
CREATE INDEX "DevelopmentalMilestone_babyId_achievedAt_idx" ON "DevelopmentalMilestone"("babyId", "achievedAt");
CREATE INDEX "BabyHealthObservation_babyId_type_observedAt_idx" ON "BabyHealthObservation"("babyId", "type", "observedAt");
CREATE TABLE "BabyProduct" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "expertReviewStatus" TEXT NOT NULL DEFAULT 'not_reviewed',
  "reviewNotes" TEXT,
  "isSample" BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX "BabyProduct_category_idx" ON "BabyProduct"("category");
CREATE INDEX "BabyProduct_brand_idx" ON "BabyProduct"("brand");
