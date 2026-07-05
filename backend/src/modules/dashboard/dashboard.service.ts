import { prisma } from "../../db/prisma";

export const dashboardService = {
  async getOverview(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      projects,
      queues,
      workers,
      jobs,
      queuedJobs,
      runningJobs,
      completedToday,
      failedToday,
      deadLetterJobs,
      retryingJobs,
      scheduledJobs,
    ] = await Promise.all([
      prisma.project.count({
        where: {
          organization: {
            members: {
              some: { userId },
            },
          },
        },
      }),

      prisma.queue.count({
        where: userOrgFilter,
      }),

      prisma.worker.count({
        where: {
          queue: userOrgFilter,
        },
      }),

      prisma.job.count({
        where: {
          queue: userOrgFilter,
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
          status: "RUNNING",
        },
      }),

      prisma.job.count({
        where: {
          queue: userOrgFilter,
          status: "COMPLETED",
          completedAt: {
            gte: today,
          },
        },
      }),

      prisma.job.count({
        where: {
          queue: userOrgFilter,
          status: "FAILED",
          failedAt: {
            gte: today,
          },
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
          status: "SCHEDULED",
        },
      }),
    ]);

    return {
      projects,
      queues,
      workers,
      jobs,
      queuedJobs,
      runningJobs,
      scheduledJobs,
      retryingJobs,
      completedToday,
      failedToday,
      deadLetterJobs,
    };
  },
};