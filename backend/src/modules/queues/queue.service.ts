import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/api-error";

type CreateQueueInput = {
  name: string;
  description?: string;
  priority?: number;
  concurrencyLimit?: number;
  projectId: string;
};

type UpdateQueueInput = {
  name?: string;
  description?: string;
  priority?: number;
  concurrencyLimit?: number;
};

export const queueService = {
  async createQueue(userId: string, data: CreateQueueInput) {
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        organization: {
          members: {
            some: { userId },
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const existingQueue = await prisma.queue.findFirst({
      where: {
        projectId: data.projectId,
        name: data.name,
      },
    });

    if (existingQueue) {
      throw new ApiError(409, "Queue with this name already exists in this project");
    }

    return prisma.queue.create({
      data: {
        name: data.name,
        description: data.description,
        priority: data.priority,
        concurrencyLimit: data.concurrencyLimit,
        projectId: data.projectId,
      },
    });
  },

  async listQueues(userId: string, projectId: string) {
    if (!projectId) {
      throw new ApiError(400, "projectId query parameter is required");
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: { userId },
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    return prisma.queue.findMany({
      where: { projectId },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
  },

  async getQueueById(userId: string, queueId: string) {
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
  },

  async updateQueue(userId: string, queueId: string, data: UpdateQueueInput) {
    const existingQueue = await this.getQueueById(userId, queueId);

    if (data.name) {
      const duplicateQueue = await prisma.queue.findFirst({
        where: {
          projectId: existingQueue.projectId,
          name: data.name,
          NOT: {
            id: queueId,
          },
        },
      });

      if (duplicateQueue) {
        throw new ApiError(409, "Queue with this name already exists in this project");
      }
    }

    return prisma.queue.update({
      where: { id: queueId },
      data,
    });
  },

  async pauseQueue(userId: string, queueId: string) {
    await this.getQueueById(userId, queueId);

    return prisma.queue.update({
      where: { id: queueId },
      data: {
        status: "PAUSED",
      },
    });
  },

  async resumeQueue(userId: string, queueId: string) {
    await this.getQueueById(userId, queueId);

    return prisma.queue.update({
      where: { id: queueId },
      data: {
        status: "ACTIVE",
      },
    });
  },

  async attachRetryPolicy(
    userId: string,
    queueId: string,
    retryPolicyId: string | null
    ) {
    const queue = await this.getQueueById(userId, queueId);

    if (retryPolicyId) {
        const retryPolicy = await prisma.retryPolicy.findFirst({
        where: {
            id: retryPolicyId,
            projectId: queue.projectId,
            project: {
            organization: {
                members: {
                some: { userId },
                },
            },
            },
        },
        });

        if (!retryPolicy) {
        throw new ApiError(404, "Retry policy not found for this queue project");
        }
    }

    return prisma.queue.update({
        where: { id: queueId },
        data: {
        retryPolicyId,
        },
        include: {
        retryPolicy: true,
        },
    });
    },

  async getQueueStatistics(userId: string, queueId: string) {
    const queue = await this.getQueueById(userId, queueId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      queued,
      scheduled,
      claimed,
      running,
      completed,
      failed,
      retrying,
      deadLetter,
      cancelled,
      onlineWorkers,
      offlineWorkers,
      shuttingDownWorkers,
      completedToday,
      completedLast24Hours,
    ] = await Promise.all([
      prisma.job.count({
        where: {
          queueId,
          status: "QUEUED",
        },
      }),

      prisma.job.count({
        where: {
          queueId,
          status: "SCHEDULED",
        },
      }),

      prisma.job.count({
        where: {
          queueId,
          status: "CLAIMED",
        },
      }),

      prisma.job.count({
        where: {
          queueId,
          status: "RUNNING",
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
          status: "RETRYING",
        },
      }),

      prisma.job.count({
        where: {
          queueId,
          status: "DEAD_LETTER",
        },
      }),

      prisma.job.count({
        where: {
          queueId,
          status: "CANCELLED",
        },
      }),

      prisma.worker.count({
        where: {
          queueId,
          status: "ONLINE",
        },
      }),

      prisma.worker.count({
        where: {
          queueId,
          status: "OFFLINE",
        },
      }),

      prisma.worker.count({
        where: {
          queueId,
          status: "SHUTTING_DOWN",
        },
      }),

      prisma.job.count({
        where: {
          queueId,
          status: "COMPLETED",
          completedAt: {
            gte: today,
          },
        },
      }),

      prisma.job.count({
        where: {
          queueId,
          status: "COMPLETED",
          completedAt: {
            gte: last24Hours,
          },
        },
      }),
    ]);

    return {
      queue: {
        id: queue.id,
        name: queue.name,
      },
      statistics: {
        queued,
        scheduled,
        claimed,
        running,
        completed,
        failed,
        retrying,
        deadLetter,
        cancelled,
      },
      workers: {
        online: onlineWorkers,
        offline: offlineWorkers,
        shuttingDown: shuttingDownWorkers,
      },
      throughput: {
        today: completedToday,
        last24Hours: completedLast24Hours,
      },
    };
  },

  async deleteQueue(userId: string, queueId: string) {
    await this.getQueueById(userId, queueId);

    await prisma.queue.delete({
      where: { id: queueId },
    });

    return {
      message: "Queue deleted successfully",
    };
  },
};