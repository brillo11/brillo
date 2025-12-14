-- CreateTable
CREATE TABLE "CronState" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentOffset" INTEGER NOT NULL DEFAULT 0,
    "batchSize" INTEGER NOT NULL DEFAULT 200,
    "totalProcessed" INTEGER NOT NULL DEFAULT 0,
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "lastRunError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CronState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CronState_name_key" ON "CronState"("name");

-- CreateIndex
CREATE INDEX "CronState_name_idx" ON "CronState"("name");

