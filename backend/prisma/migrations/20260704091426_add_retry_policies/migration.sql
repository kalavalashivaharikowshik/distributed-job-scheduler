-- CreateEnum
CREATE TYPE "BackoffType" AS ENUM ('FIXED', 'LINEAR', 'EXPONENTIAL');

-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "retryPolicyId" TEXT;

-- CreateTable
CREATE TABLE "RetryPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "initialDelayMs" INTEGER NOT NULL DEFAULT 1000,
    "maxDelayMs" INTEGER,
    "backoffType" "BackoffType" NOT NULL DEFAULT 'FIXED',
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetryPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RetryPolicy_projectId_idx" ON "RetryPolicy"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "RetryPolicy_projectId_name_key" ON "RetryPolicy"("projectId", "name");

-- CreateIndex
CREATE INDEX "Queue_retryPolicyId_idx" ON "Queue"("retryPolicyId");

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_retryPolicyId_fkey" FOREIGN KEY ("retryPolicyId") REFERENCES "RetryPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetryPolicy" ADD CONSTRAINT "RetryPolicy_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
