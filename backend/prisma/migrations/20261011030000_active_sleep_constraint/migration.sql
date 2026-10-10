CREATE UNIQUE INDEX "SleepSession_one_active_per_baby"
ON "SleepSession"("babyId")
WHERE "endTime" IS NULL;
