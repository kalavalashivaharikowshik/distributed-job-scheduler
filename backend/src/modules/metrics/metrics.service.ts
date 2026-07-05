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

async function validateWorkerAccess(userId: string, workerId: string) {
  const worker = await prisma.worker.findFirst({
    where: {
      id: workerId,
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
  });

  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  return worker;
}

function calculateSuccessRate(completed: number, failed: number) {
  const total = completed + failed;

  if (total === 0) {
    return 0;
  }

  return Number(((completed / total) * 100).toFixed(2));
}

export const metricsService = {
  async getSystemMetrics(userId: string) {
    const userOrgFilter = {
      project: {
        organization: {
          members: {
            some: { userId },
          },
        },
      },
    };

    const [
      totalJobs,
      completedJobs,
      failedJobs,
      deadLetterJobs,
      retryingJobs,
      queuedJobs,
      scheduledJobs,
      runningJobs,
      workersOnline,
      workersOffline,
      avgExecution,
    ] = await Promise.all([
      prisma.job.count({
        where: {
          queue: userOrgFilter,
        },
      }),

      prisma.job.count({
        where: {
          queue: userOrgFilter,
          status: "COMPLETED",
        },
      }),

      prisma.job.count({
        where: {
          queue: userOrgFilter,
          status: "FAILED",
        },
      }),

      prisma.job.count({
        where: {
          queue: userOrgFilter,
          status: "DEAD_LETTER",
        },
      }),

      prisma.job.count({
        where: {
          queue: userOrgFilter,
          status: "RETRYING",
        },
      }),

      prisma.job.count({
        where: {
          queue: userOrgFilter,
          status: "QUEUED",
        },
      }),

      prisma.job.count({
        where: {
          queue: userOrgFilter,
          status: "SCHEDULED",
        },
      }),

      prisma.job.count({
        where: {
          queue: userOrgFilter,
          status: "RUNNING",
        },
      }),

      prisma.worker.count({
        where: {
          queue: userOrgFilter,
          status: "ONLINE",
        },
      }),

      prisma.worker.count({
        where: {
          queue: userOrgFilter,
          status: "OFFLINE",
        },
      }),

      prisma.jobExecution.aggregate({
        where: {
          job: {
            queue: userOrgFilter,
          },
          durationMs: {
            not: null,
          },
        },
        _avg: {
          durationMs: true,
        },
      }),
    ]);

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      deadLetterJobs,
      retryingJobs,
      queuedJobs,
      scheduledJobs,
      runningJobs,
      workersOnline,
      workersOffline,
      successRate: calculateSuccessRate(completedJobs, failedJobs + deadLetterJobs),
      averageExecutionTimeMs: Math.round(avgExecution._avg.durationMs || 0),
    };
  },

  async getQueueMetrics(userId: string, queueId: string) {
    const queue = await validateQueueAccess(userId, queueId);

    const [
      totalExecutions,
      completedExecutions,
      failedExecutions,
      avgExecution,
      completedJobs,
      failedJobs,
      deadLetterJobs,
    ] = await Promise.all([
      prisma.jobExecution.count({
        where: {
          job: {
            queueId,
          },
        },
      }),

      prisma.jobExecution.count({
        where: {
          job: {
            queueId,
          },
          status: "COMPLETED",
        },
      }),

      prisma.jobExecution.count({
        where: {
          job: {
            queueId,
          },
          status: "FAILED",
        },
      }),

      prisma.jobExecution.aggregate({
        where: {
          job: {
            queueId,
          },
          durationMs: {
            not: null,
          },
        },
        _avg: {
          durationMs: true,
        },
      }),

      prisma.job.count({
        where: {
          queueId,
          status: "COMPLETED",
        },
      }),

      prisma.job.count({
        where: {
          queueId,
          status: "FAILED",
        },
      }),

      prisma.job.count({
        where: {
          queueId,
          status: "DEAD_LETTER",
        },
      }),
    ]);

    return {
      queue: {
        id: queue.id,
        name: queue.name,
      },
      totalExecutions,
      completedExecutions,
      failedExecutions,
      completedJobs,
      failedJobs,
      deadLetterJobs,
      successRate: calculateSuccessRate(completedExecutions, failedExecutions),
      averageExecutionTimeMs: Math.round(avgExecution._avg.durationMs || 0),
    };
  },

  async getWorkerMetrics(userId: string, workerId: string) {
    const worker = await validateWorkerAccess(userId, workerId);

    const [
      totalExecutions,
      completedExecutions,
      failedExecutions,
      avgExecution,
      runningJobs,
    ] = await Promise.all([
      prisma.jobExecution.count({
        where: {
          workerId,
        },
      }),

      prisma.jobExecution.count({
        where: {
          workerId,
          status: "COMPLETED",
        },
      }),

      prisma.jobExecution.count({
        where: {
          workerId,
          status: "FAILED",
        },
      }),

      prisma.jobExecution.aggregate({
        where: {
          workerId,
          durationMs: {
            not: null,
          },
        },
        _avg: {
          durationMs: true,
        },
      }),

      prisma.job.count({
        where: {
          claimedByWorkerId: workerId,
          status: {
            in: ["CLAIMED", "RUNNING"],
          },
        },
      }),
    ]);

    return {
      worker: {
        id: worker.id,
        name: worker.name,
        status: worker.status,
      },
      totalExecutions,
      completedExecutions,
      failedExecutions,
      runningJobs,
      successRate: calculateSuccessRate(completedExecutions, failedExecutions),
      averageExecutionTimeMs: Math.round(avgExecution._avg.durationMs || 0),
    };
  },
};