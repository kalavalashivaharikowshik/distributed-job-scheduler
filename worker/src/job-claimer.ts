import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { logger } from "./logger";

export async function claimJob(workerId: string, queueId: string) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const job = await tx.job.findFirst({
      where: {
        queueId,
        status: "QUEUED",
        queue: {
          status: "ACTIVE",
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });

    if (!job) {
      return null;
    }

    const claimedJob = await tx.job.updateMany({
      where: {
        id: job.id,
        status: "QUEUED",
      },
      data: {
        status: "CLAIMED",
        claimedByWorkerId: workerId,
        claimedAt: new Date(),
        lastHeartbeatAt: new Date(),
      },
    });

    if (claimedJob.count === 0) {
      logger.info(`Job ${job.id} was already claimed by another worker`);
      return null;
    }

    await tx.jobLog.create({
      data: {
        jobId: job.id,
        level: "INFO",
        message: `Job claimed by worker ${workerId}`,
      },
    });

    return tx.job.findUnique({
      where: { id: job.id },
    });
  });
}