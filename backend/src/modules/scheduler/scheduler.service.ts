import { CronExpressionParser } from "cron-parser";
import { prisma } from "../../db/prisma";

function getNextCronRun(cronExpression: string, fromDate: Date) {
  const interval = CronExpressionParser.parse(cronExpression, {
    currentDate: fromDate,
  });

  return interval.next().toDate();
}

export const schedulerService = {
  async processDueJobs() {
    const now = new Date();

    const dueJobs = await prisma.job.findMany({
      where: {
        status: {
            in: ["SCHEDULED", "RETRYING"],
        },
        nextRunAt: {
            lte: now,
        },
    },
      include: {
        scheduledJob: true,
        queue: {
          include: {
            retryPolicy: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { nextRunAt: "asc" }],
    });

    let queuedJobs = 0;
    let recurringJobsUpdated = 0;

    for (const job of dueJobs) {
      if (job.type === "RECURRING") {
        if (!job.cronExpression) continue;

        const nextRunAt = getNextCronRun(job.cronExpression, now);

        await prisma.$transaction([
          prisma.job.create({
            data: {
              name: `${job.name}-run`,
              type: "IMMEDIATE",
              status: "QUEUED",
              payload: job.payload as any,
              priority: job.priority,
              queueId: job.queueId,
              maxAttempts: job.maxAttempts,
            },
          }),

          prisma.job.update({
            where: { id: job.id },
            data: {
              nextRunAt,
              scheduledAt: nextRunAt,
            },
          }),

          prisma.scheduledJob.update({
            where: { jobId: job.id },
            data: {
              scheduledAt: nextRunAt,
            },
          }),
        ]);

        queuedJobs++;
        recurringJobsUpdated++;
      } else {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "QUEUED",
            nextRunAt: null,
            failedAt: null,
          },
        });

        queuedJobs++;
      }
    }

    return {
      processed: dueJobs.length,
      queuedJobs,
      recurringJobsUpdated,
    };
  },
};