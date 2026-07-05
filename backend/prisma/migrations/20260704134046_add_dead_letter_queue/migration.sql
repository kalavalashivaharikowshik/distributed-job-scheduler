-- CreateTable
CREATE TABLE "DeadLetterQueue" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "errorMessage" TEXT,
    "failedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeadLetterQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeadLetterQueue_jobId_key" ON "DeadLetterQueue"("jobId");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_jobId_idx" ON "DeadLetterQueue"("jobId");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_queueId_idx" ON "DeadLetterQueue"("queueId");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_failedAt_idx" ON "DeadLetterQueue"("failedAt");

-- AddForeignKey
ALTER TABLE "DeadLetterQueue" ADD CONSTRAINT "DeadLetterQueue_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadLetterQueue" ADD CONSTRAINT "DeadLetterQueue_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
