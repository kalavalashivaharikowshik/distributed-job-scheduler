import { prisma } from "./prisma";
import { logger } from "./logger";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateRetryDelayMs(
  backoffType: string,
  initialDelayMs: number,
  attempt: number,
  maxDelayMs?: number | null
) {
  let delay = initialDelayMs;

  if (backoffType === "LINEAR") {
    delay = initialDelayMs * attempt;
  }

  if (backoffType === "EXPONENTIAL") {
    delay = initialDelayMs * Math.pow(2, attempt - 1);
  }

  if (maxDelayMs) {
    delay = Math.min(delay, maxDelayMs);
  }

  return delay;
}

export async function runJob(jobId: string, workerId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      queue: {
        include: {
          retryPolicy: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  logger.info(`Starting job ${job.id} (${job.name})`);

  const startedAt = new Date();
  const attempt = job.attemptsMade + 1;

  const execution = await prisma.jobExecution.create({
    data: {
      jobId: job.id,
      workerId,
      attempt,
      status: "RUNNING",
      startedAt,
    },
  });

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "RUNNING",
      startedAt,
      attemptsMade: attempt,
      lastHeartbeatAt: new Date(),
    },
  });

  await prisma.jobLog.create({
    data: {
      jobId: job.id,
      level: "INFO",
      message: `Job started by worker ${workerId}, attempt ${attempt}`,
    },
  });

  try {
    await sleep(3000);

    const payload = job.payload as {
      shouldFail?: boolean;
      failUntilAttempt?: number;
    };

    if (payload.shouldFail) {
      throw new Error("Intentional job failure from payload.shouldFail");
    }

    if (payload.failUntilAttempt && attempt <= payload.failUntilAttempt) {
      throw new Error(`Intentional failure until attempt ${payload.failUntilAttempt}`);
    }

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    await prisma.$transaction([
      prisma.job.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          completedAt,
          failedAt: null,
          nextRunAt: null,
          lastHeartbeatAt: completedAt,
        },
      }),

      prisma.jobExecution.update({
        where: { id: execution.id },
        data: {
          status: "COMPLETED",
          completedAt,
          durationMs,
        },
      }),

      prisma.jobLog.create({
        data: {
          jobId: job.id,
          level: "INFO",
          message: `Job completed successfully in ${durationMs}ms`,
        },
      }),
    ]);

    logger.info(`Completed job ${job.id}`);
  } catch (error) {
    const failedAt = new Date();
    const durationMs = failedAt.getTime() - startedAt.getTime();
    const errorMessage = (error as Error).message;

    const retryPolicy = job.queue.retryPolicy;
    const maxAttempts = job.maxAttempts || retryPolicy?.maxAttempts || 1;

    if (attempt < maxAttempts && retryPolicy) {
      const delayMs = calculateRetryDelayMs(
        retryPolicy.backoffType,
        retryPolicy.initialDelayMs,
        attempt,
        retryPolicy.maxDelayMs
      );

      const nextRunAt = new Date(Date.now() + delayMs);

      await prisma.$transaction([
        prisma.job.update({
          where: { id: job.id },
          data: {
            status: "RETRYING",
            failedAt,
            nextRunAt,
            claimedByWorkerId: null,
            claimedAt: null,
            startedAt: null,
            lastHeartbeatAt: failedAt,
          },
        }),

        prisma.jobExecution.update({
          where: { id: execution.id },
          data: {
            status: "FAILED",
            failedAt,
            durationMs,
            errorMessage,
          },
        }),

        prisma.jobLog.create({
          data: {
            jobId: job.id,
            level: "ERROR",
            message: `Job failed on attempt ${attempt}. Retrying at ${nextRunAt.toISOString()}. Error: ${errorMessage}`,
          },
        }),
      ]);

      logger.error(`Job ${job.id} failed, scheduled for retry`);
      return;
    }

    await prisma.$transaction([
    prisma.job.update({
        where: { id: job.id },
        data: {
        status: "DEAD_LETTER",
        failedAt,
        claimedByWorkerId: null,
        claimedAt: null,
        startedAt: null,
        lastHeartbeatAt: failedAt,
        },
    }),

    prisma.jobExecution.update({
        where: { id: execution.id },
        data: {
        status: "FAILED",
        failedAt,
        durationMs,
        errorMessage,
        },
    }),

    prisma.deadLetterQueue.upsert({
        where: {
        jobId: job.id,
        },
        update: {
        reason: "Job exceeded maximum retry attempts",
        errorMessage,
        failedAt,
        },
        create: {
        jobId: job.id,
        queueId: job.queueId,
        reason: "Job exceeded maximum retry attempts",
        errorMessage,
        failedAt,
        },
    }),

    prisma.jobLog.create({
        data: {
        jobId: job.id,
        level: "ERROR",
        message: `Job moved to Dead Letter Queue after attempt ${attempt}. Error: ${errorMessage}`,
        },
    }),
    ]);
    logger.error(`Job ${job.id} moved to Dead Letter Queue`);
  }
}