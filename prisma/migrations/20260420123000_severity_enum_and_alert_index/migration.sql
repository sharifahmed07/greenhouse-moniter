CREATE TYPE "Severity" AS ENUM ('normal', 'warning', 'critical');

ALTER TABLE "SensorReading"
ALTER COLUMN "severity" TYPE "Severity"
USING "severity"::"Severity";

CREATE INDEX "SensorReading_severity_recordedAt_idx" ON "SensorReading"("severity", "recordedAt");
