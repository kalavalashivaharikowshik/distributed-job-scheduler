import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/api-error";

type RegisterWorkerInput = {
  name: string;
  queueId: string;
  concurrency?: number;
};

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

export const workerService = {
  async registerWorker(userId: string, data: RegisterWorkerInput) {
    await validateQueueAccess(userId, data.queueId);

    const worker = await prisma.worker.create({
      data: {
        name: data.name,
        queueId: data.queueId,
        concurrency: data.concurrency,
        status: "ONLINE",
        lastHeartbeatAt: new Date(),
      },
    });

    await prisma.workerHeartbeat.create({
      data: {
        workerId: worker.id,
      },
    });

    return worker;
  },

  async sendHeartbeat(userId: string, workerId: string) {
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

    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        status: "ONLINE",
        lastHeartbeatAt: new Date(),
      },
    });

    await prisma.workerHeartbeat.create({
      data: {
        workerId,
      },
    });

    return updatedWorker;
  },

  async listWorkers(userId: string, queueId: string) {
    if (!queueId) {
      throw new ApiError(400, "queueId query parameter is required");
    }

    await validateQueueAccess(userId, queueId);

    return prisma.worker.findMany({
      where: { queueId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getWorkerById(userId: string, workerId: string) {
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
      include: {
        heartbeats: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!worker) {
      throw new ApiError(404, "Worker not found");
    }

    return worker;
  },

  async getRunningJobs(userId: string, workerId: string) {
    await this.getWorkerById(userId, workerId);

    return prisma.job.findMany({
        where: {
        claimedByWorkerId: workerId,
        status: {
            in: ["CLAIMED", "RUNNING"],
        },
        },
        orderBy: {
        startedAt: "desc",
        },
    });
    },

    async getWorkerHealth(userId: string, queueId: string) {
    if (!queueId) {
        throw new ApiError(400, "queueId query parameter is required");
    }

    await validateQueueAccess(userId, queueId);

    const workers = await prisma.worker.findMany({
        where: {
        queueId,
        },
        include: {
        claimedJobs: {
            where: {
            status: {
                in: ["CLAIMED", "RUNNING"],
            },
            },
        },
        },
        orderBy: {
        createdAt: "desc",
        },
    });

    const now = Date.now();

    return workers.map((worker) => {
        const heartbeatAgeMs = worker.lastHeartbeatAt
        ? now - worker.lastHeartbeatAt.getTime()
        : null;

        return {
        id: worker.id,
        name: worker.name,
        status: worker.status,
        concurrency: worker.concurrency,
        lastHeartbeatAt: worker.lastHeartbeatAt,
        heartbeatAgeMs,
        runningJobs: worker.claimedJobs.length,
        isHealthy:
            worker.status === "ONLINE" &&
            heartbeatAgeMs !== null &&
            heartbeatAgeMs < 30000,
        };
    });
    },

    async markStaleWorkersOffline(userId: string) {
    const staleBefore = new Date(Date.now() - 30 * 1000);

    const accessibleQueues = await prisma.queue.findMany({
        where: {
        project: {
            organization: {
            members: {
                some: { userId },
            },
            },
        },
        },
        select: {
        id: true,
        },
    });

    const queueIds = accessibleQueues.map((queue) => queue.id);

    const result = await prisma.worker.updateMany({
        where: {
        queueId: {
            in: queueIds,
        },
        status: "ONLINE",
        lastHeartbeatAt: {
            lt: staleBefore,
        },
        },
        data: {
        status: "OFFLINE",
        stoppedAt: new Date(),
        },
    });

    return {
        markedOffline: result.count,
    };
    },

  async markWorkerShuttingDown(userId: string, workerId: string) {
    await this.getWorkerById(userId, workerId);

    return prisma.worker.update({
      where: { id: workerId },
      data: {
        status: "SHUTTING_DOWN",
      },
    });
  },

  async markWorkerOffline(userId: string, workerId: string) {
    await this.getWorkerById(userId, workerId);

    return prisma.worker.update({
      where: { id: workerId },
      data: {
        status: "OFFLINE",
        stoppedAt: new Date(),
      },
    });
  },
};