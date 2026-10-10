-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "supabaseUserId" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMembership" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'parent',
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyInvitation" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'parent',
    "tokenHash" TEXT NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivacyConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaternalProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackingMode" TEXT NOT NULL DEFAULT 'menstrual',
    "lastPeriodStartDate" TIMESTAMP(3),
    "averageCycleLength" INTEGER,
    "averagePeriodDays" INTEGER,
    "estimatedDueDate" TIMESTAMP(3),
    "multiplesCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaternalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenstrualDailyLog" (
    "id" TEXT NOT NULL,
    "maternalProfileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bleedingIntensity" TEXT,
    "basalTemperature" DOUBLE PRECISION,
    "temperatureUnit" TEXT,
    "cervicalMucus" TEXT,
    "lhTestResult" TEXT,
    "lhPhotoReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenstrualDailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PregnancyDailyLog" (
    "id" TEXT NOT NULL,
    "maternalProfileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nauseaVomiting" TEXT,
    "fatigue" TEXT,
    "brainFog" TEXT,
    "mood" TEXT,
    "anxiety" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PregnancyDailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthMeasurement" (
    "id" TEXT NOT NULL,
    "maternalProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "unit" TEXT,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "context" TEXT,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HormoneMeasurement" (
    "id" TEXT NOT NULL,
    "maternalProfileId" TEXT NOT NULL,
    "hormone" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HormoneMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Baby" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyId" TEXT,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "sexAtBirth" TEXT,
    "initialWeight" DOUBLE PRECISION,
    "weightUnit" TEXT,
    "initialHeight" DOUBLE PRECISION,
    "heightUnit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Baby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentalMilestone" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevelopmentalMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BabyHealthObservation" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "unit" TEXT,
    "severity" TEXT,
    "notes" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BabyHealthObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BabyHeightMeasurement" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BabyHeightMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepSession" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SleepSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedingSession" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "feedingType" TEXT NOT NULL,
    "feedingMethod" TEXT,
    "milkType" TEXT,
    "amount" DOUBLE PRECISION,
    "unit" TEXT,
    "foodName" TEXT,
    "foodDescription" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaperChange" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "DiaperChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expert" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "specialty" TEXT NOT NULL,
    "serviceCategory" TEXT NOT NULL DEFAULT 'general',
    "audience" TEXT NOT NULL DEFAULT 'family',
    "credentials" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL,
    "affiliationStatus" TEXT NOT NULL DEFAULT 'external_unpartnered',
    "description" TEXT NOT NULL,
    "profileImage" TEXT,
    "contactMethod" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "sourceUrl" TEXT,
    "availabilityStatus" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Expert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "babyId" TEXT,
    "question" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "questionId" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationalResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "EducationalResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "ageGuidance" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "expertReviewStatus" TEXT NOT NULL DEFAULT 'not_reviewed',
    "isSample" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NutritionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BabyProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "expertReviewStatus" TEXT NOT NULL DEFAULT 'not_reviewed',
    "reviewNotes" TEXT,
    "isSample" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BabyProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "User"("supabaseUserId");

-- CreateIndex
CREATE INDEX "FamilyMembership_userId_status_idx" ON "FamilyMembership"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMembership_familyId_userId_key" ON "FamilyMembership"("familyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInvitation_tokenHash_key" ON "FamilyInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "FamilyInvitation_email_expiresAt_idx" ON "FamilyInvitation"("email", "expiresAt");

-- CreateIndex
CREATE INDEX "FamilyInvitation_familyId_idx" ON "FamilyInvitation"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyConsent_userId_policyVersion_key" ON "PrivacyConsent"("userId", "policyVersion");

-- CreateIndex
CREATE UNIQUE INDEX "MaternalProfile_userId_key" ON "MaternalProfile"("userId");

-- CreateIndex
CREATE INDEX "MenstrualDailyLog_maternalProfileId_date_idx" ON "MenstrualDailyLog"("maternalProfileId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MenstrualDailyLog_maternalProfileId_date_key" ON "MenstrualDailyLog"("maternalProfileId", "date");

-- CreateIndex
CREATE INDEX "PregnancyDailyLog_maternalProfileId_date_idx" ON "PregnancyDailyLog"("maternalProfileId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PregnancyDailyLog_maternalProfileId_date_key" ON "PregnancyDailyLog"("maternalProfileId", "date");

-- CreateIndex
CREATE INDEX "HealthMeasurement_maternalProfileId_type_measuredAt_idx" ON "HealthMeasurement"("maternalProfileId", "type", "measuredAt");

-- CreateIndex
CREATE INDEX "HormoneMeasurement_maternalProfileId_hormone_measuredAt_idx" ON "HormoneMeasurement"("maternalProfileId", "hormone", "measuredAt");

-- CreateIndex
CREATE INDEX "Baby_userId_idx" ON "Baby"("userId");

-- CreateIndex
CREATE INDEX "Baby_familyId_idx" ON "Baby"("familyId");

-- CreateIndex
CREATE INDEX "DevelopmentalMilestone_babyId_achievedAt_idx" ON "DevelopmentalMilestone"("babyId", "achievedAt");

-- CreateIndex
CREATE INDEX "BabyHealthObservation_babyId_type_observedAt_idx" ON "BabyHealthObservation"("babyId", "type", "observedAt");

-- CreateIndex
CREATE INDEX "BabyHeightMeasurement_babyId_measuredAt_idx" ON "BabyHeightMeasurement"("babyId", "measuredAt");

-- CreateIndex
CREATE INDEX "SleepSession_babyId_startTime_idx" ON "SleepSession"("babyId", "startTime");

-- CreateIndex
CREATE INDEX "SleepSession_babyId_endTime_idx" ON "SleepSession"("babyId", "endTime");

-- CreateIndex
CREATE INDEX "FeedingSession_babyId_startTime_idx" ON "FeedingSession"("babyId", "startTime");

-- CreateIndex
CREATE INDEX "DiaperChange_babyId_timestamp_idx" ON "DiaperChange"("babyId", "timestamp");

-- CreateIndex
CREATE INDEX "Expert_specialty_idx" ON "Expert"("specialty");

-- CreateIndex
CREATE INDEX "Expert_serviceCategory_idx" ON "Expert"("serviceCategory");

-- CreateIndex
CREATE INDEX "Expert_audience_idx" ON "Expert"("audience");

-- CreateIndex
CREATE INDEX "ParentQuestion_userId_createdAt_idx" ON "ParentQuestion"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ParentQuestion_babyId_idx" ON "ParentQuestion"("babyId");

-- CreateIndex
CREATE INDEX "ConsultationRequest_userId_createdAt_idx" ON "ConsultationRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ConsultationRequest_expertId_idx" ON "ConsultationRequest"("expertId");

-- CreateIndex
CREATE INDEX "EducationalResource_category_idx" ON "EducationalResource"("category");

-- CreateIndex
CREATE INDEX "NutritionProduct_category_idx" ON "NutritionProduct"("category");

-- CreateIndex
CREATE INDEX "NutritionProduct_brand_idx" ON "NutritionProduct"("brand");

-- CreateIndex
CREATE INDEX "NutritionProduct_name_idx" ON "NutritionProduct"("name");

-- CreateIndex
CREATE INDEX "BabyProduct_category_idx" ON "BabyProduct"("category");

-- CreateIndex
CREATE INDEX "BabyProduct_brand_idx" ON "BabyProduct"("brand");

-- AddForeignKey
ALTER TABLE "FamilyMembership" ADD CONSTRAINT "FamilyMembership_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMembership" ADD CONSTRAINT "FamilyMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvitation" ADD CONSTRAINT "FamilyInvitation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivacyConsent" ADD CONSTRAINT "PrivacyConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaternalProfile" ADD CONSTRAINT "MaternalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenstrualDailyLog" ADD CONSTRAINT "MenstrualDailyLog_maternalProfileId_fkey" FOREIGN KEY ("maternalProfileId") REFERENCES "MaternalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PregnancyDailyLog" ADD CONSTRAINT "PregnancyDailyLog_maternalProfileId_fkey" FOREIGN KEY ("maternalProfileId") REFERENCES "MaternalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthMeasurement" ADD CONSTRAINT "HealthMeasurement_maternalProfileId_fkey" FOREIGN KEY ("maternalProfileId") REFERENCES "MaternalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HormoneMeasurement" ADD CONSTRAINT "HormoneMeasurement_maternalProfileId_fkey" FOREIGN KEY ("maternalProfileId") REFERENCES "MaternalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Baby" ADD CONSTRAINT "Baby_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Baby" ADD CONSTRAINT "Baby_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentalMilestone" ADD CONSTRAINT "DevelopmentalMilestone_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BabyHealthObservation" ADD CONSTRAINT "BabyHealthObservation_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BabyHeightMeasurement" ADD CONSTRAINT "BabyHeightMeasurement_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepSession" ADD CONSTRAINT "SleepSession_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedingSession" ADD CONSTRAINT "FeedingSession_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaperChange" ADD CONSTRAINT "DiaperChange_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentQuestion" ADD CONSTRAINT "ParentQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentQuestion" ADD CONSTRAINT "ParentQuestion_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationRequest" ADD CONSTRAINT "ConsultationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationRequest" ADD CONSTRAINT "ConsultationRequest_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "Expert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationRequest" ADD CONSTRAINT "ConsultationRequest_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ParentQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Only one active (unfinished) sleep session per baby, enforced by the database.
CREATE UNIQUE INDEX "SleepSession_one_active_per_baby" ON "SleepSession"("babyId") WHERE "endTime" IS NULL;

-- Supabase exposes the public schema through its Data API. Enable RLS with no policies so
-- these tables are reachable only through the Nurture API (which connects as the database owner).
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Family" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyMembership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyInvitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrivacyConsent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MaternalProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenstrualDailyLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PregnancyDailyLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HealthMeasurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HormoneMeasurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Baby" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DevelopmentalMilestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BabyHealthObservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BabyHeightMeasurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SleepSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeedingSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiaperChange" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ParentQuestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsultationRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EducationalResource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NutritionProduct" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BabyProduct" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
