import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/api-error";

async function validateQueueAccess(userId: string, queueId: string) {
  const queue = await prisma.queue.findFirst({
    where: {
      id: queueId,
      project: {
        organization: {
          members: {
            some: { userId },
          },
        },
      },
    },
  });

  if (!queue) {
    throw new ApiError(404, "Queue not found");
  }

  return queue;
}

export const dlqService = {
  async listEntries(userId: string, queueId: string) {
    if (!queueId) {
      throw new ApiError(400, "queueId query parameter is required");
    }

    await validateQueueAccess(userId, queueId);

    return prisma.deadLetterQueue.findMany({
      where: { queueId },
      include: {
        job: true,
      },
      orderBy: {
        failedAt: "desc",
      },
    });
  },

  async getEntryById(userId: string, entryId: string) {
    const entry = await prisma.deadLetterQueue.findFirst({
      where: {
        id: entryId,
        queue: {
          project: {
            organization: {
              members: {
                some: { userId },
              },
            },
          },
        },
      },
      include: {
        job: {
          include: {
            executions: {
              orderBy: {
                startedAt: "desc",
              },
            },
            logs: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!entry) {
      throw new ApiError(404, "Dead letter entry not found");
    }

    return entry;
  },

  async retryEntry(userId: string, entryId: string) {
    const entry = await this.getEntryById(userId, entryId);

    const updatedJob = await prisma.$transaction(async (tx) => {
      const job = await tx.job.update({
        where: {
          id: entry.jobId,
        },
        data: {
        status: "QUEUED",
        attemptsMade: 0,
        failedAt: null,
        nextRunAt: null,
        claimedByWorkerId: null,
        claimedAt: null,
        startedAt: null,
        completedAt: null,
        lastHeartbeatAt: null,
        },
      });

      await tx.deadLetterQueue.delete({
        where: {
          id: entryId,
        },
      });

      await tx.jobLog.create({
        data: {
          jobId: entry.jobId,
          level: "INFO",
          message: "Job retried from Dead Letter Queue",
        },
      });

      return job;
    });

    return updatedJob;
  },
};