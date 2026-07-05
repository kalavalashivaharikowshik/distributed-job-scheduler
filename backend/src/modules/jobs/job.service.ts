import { randomUUID } from "crypto";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/api-error";

type CreateJobInput = {
  name: string;
  type?: "IMMEDIATE" | "DELAYED" | "SCHEDULED" | "RECURRING";
  payload: Record<string, any>;
  priority?: number;
  queueId: string;
  scheduledAt?: string;
  delayMs?: number;
  cronExpression?: string;
};

type CreateBatchJobInput = {
  queueId: string;
  jobs: {
    name: string;
    payload: Record<string, any>;
    priority?: number;
  }[];
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
    include: {
      retryPolicy: true,
    },
  });

  if (!queue) {
    throw new ApiError(404, "Queue not found");
  }

  return queue;
}

export const jobService = {
  async createJob(userId: string, data: CreateJobInput) {
    const queue = await validateQueueAccess(userId, data.queueId);

    if (queue.status === "PAUSED") {
      throw new ApiError(400, "Cannot add jobs to a paused queue");
    }

    const type = data.type || "IMMEDIATE";

    let status: "QUEUED" | "SCHEDULED" = "QUEUED";
    let scheduledAt: Date | undefined;
    let nextRunAt: Date | undefined;

    if (type === "DELAYED") {
      if (!data.delayMs) {
        throw new ApiError(400, "delayMs is required for delayed jobs");
      }

      scheduledAt = new Date(Date.now() + data.delayMs);
      nextRunAt = scheduledAt;
      status = "SCHEDULED";
    }

    if (type === "SCHEDULED") {
      if (!data.scheduledAt) {
        throw new ApiError(400, "scheduledAt is required for scheduled jobs");
      }

      scheduledAt = new Date(data.scheduledAt);
      nextRunAt = scheduledAt;
      status = "SCHEDULED";
    }

    if (type === "RECURRING") {
      if (!data.cronExpression) {
        throw new ApiError(400, "cronExpression is required for recurring jobs");
      }

      if (!data.scheduledAt) {
        throw new ApiError(400, "scheduledAt is required as first run time for recurring jobs");
      }

      scheduledAt = new Date(data.scheduledAt);
      nextRunAt = scheduledAt;
      status = "SCHEDULED";
    }

    const maxAttempts = queue.retryPolicy?.maxAttempts;

    const job = await prisma.job.create({
      data: {
        name: data.name,
        type,
        status,
        payload: data.payload,
        priority: data.priority,
        queueId: data.queueId,
        maxAttempts,
        scheduledAt,
        nextRunAt,
        cronExpression: data.cronExpression,
        scheduledJob: scheduledAt
          ? {
              create: {
                scheduledAt,
                cronExpression: data.cronExpression,
                isRecurring: type === "RECURRING",
              },
            }
          : undefined,
      },
      include: {
        scheduledJob: true,
      },
    });

    return job;
  },

  async createBatchJobs(userId: string, data: CreateBatchJobInput) {
    const queue = await validateQueueAccess(userId, data.queueId);

    if (queue.status === "PAUSED") {
      throw new ApiError(400, "Cannot add jobs to a paused queue");
    }

    const batchId = randomUUID();

    const jobs = await prisma.$transaction(
      data.jobs.map((job) =>
        prisma.job.create({
          data: {
            name: job.name,
            type: "BATCH",
            status: "QUEUED",
            payload: job.payload,
            priority: job.priority,
            queueId: data.queueId,
            batchId,
            maxAttempts: queue.retryPolicy?.maxAttempts,
          },
        })
      )
    );

    return {
      batchId,
      count: jobs.length,
      jobs,
    };
  },

  async listJobs(
    userId: string,
    query: {
      queueId: string;
      status?: string;
      page?: string;
      limit?: string;
    }
  ) {
    await validateQueueAccess(userId, query.queueId);

    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;

    const where = {
      queueId: query.queueId,
      ...(query.status ? { status: query.status as any } : {}),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getJobById(userId: string, jobId: string) {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
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
        scheduledJob: true,
        queue: true,
      },
    });

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return job;
  },

  async getJobLogs(userId: string, jobId: string) {
    await this.getJobById(userId, jobId);

    return prisma.jobLog.findMany({
      where: {
        jobId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getJobExecutions(userId: string, jobId: string) {
    await this.getJobById(userId, jobId);

    return prisma.jobExecution.findMany({
      where: {
        jobId,
      },
      include: {
        worker: true,
      },
      orderBy: {
        startedAt: "desc",
      },
    });
  },

  async cancelJob(userId: string, jobId: string) {
    const job = await this.getJobById(userId, jobId);

    if (
      ["CLAIMED", "RUNNING", "COMPLETED", "DEAD_LETTER"].includes(job.status)
    ) {
      throw new ApiError(
        400,
        "Cannot cancel claimed, running, completed, or dead letter job"
      );
    }
    return prisma.job.update({
      where: { id: jobId },
      data: {
        status: "CANCELLED",
      },
    });
  },
};