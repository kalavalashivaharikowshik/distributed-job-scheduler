import { config } from "./config";
import { prisma } from "./prisma";
import { logger } from "./logger";
import { startHeartbeat } from "./heartbeat";
import { claimJob } from "./job-claimer";
import { runJob } from "./job-runner";
import { setupGracefulShutdown } from "./graceful-shutdown";
import express from "express";

let isPolling = true;
let activeJobs = 0;

function startHealthServer() {
  const app = express();
  const port = process.env.PORT || 5001;

  app.get("/", (_req, res) => {
    res.json({
      status: "ok",
      service: "distributed-job-scheduler-worker",
    });
  });

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "distributed-job-scheduler-worker",
      workerName: config.workerName,
      queueId: config.queueId,
    });
  });

  app.listen(port, () => {
    logger.info(`Worker health server running on port ${port}`);
  });
}

async function registerWorker() {
  const worker = await prisma.worker.create({
    data: {
      name: config.workerName,
      queueId: config.queueId,
      concurrency: config.concurrency,
      status: "ONLINE",
      lastHeartbeatAt: new Date(),
    },
  });

  await prisma.workerHeartbeat.create({
    data: {
      workerId: worker.id,
    },
  });

  logger.info(`Worker registered: ${worker.id}`);

  return worker;
}

async function poll(workerId: string) {
  if (!isPolling) return;

  while (activeJobs < config.concurrency) {
    const job = await claimJob(workerId, config.queueId);

    if (!job) {
      break;
    }

    activeJobs++;

    runJob(job.id, workerId)
      .catch((error) => {
        logger.error(`Job failed: ${(error as Error).message}`);
      })
      .finally(() => {
        activeJobs--;
      });
  }
}

async function main() {
  startHealthServer();
  if (!config.queueId) {
    throw new Error("QUEUE_ID is required in worker/.env");
  }

  const queue = await prisma.queue.findUnique({
    where: { id: config.queueId },
  });

  if (!queue) {
    throw new Error(`Queue not found: ${config.queueId}`);
  }

  const worker = await registerWorker();

  const heartbeatTimer = startHeartbeat(
    worker.id,
    config.heartbeatIntervalMs
  );

  const pollingTimer = setInterval(() => {
    poll(worker.id).catch((error) => {
      logger.error(`Polling error: ${(error as Error).message}`);
    });
  }, config.pollIntervalMs);

  setupGracefulShutdown(worker.id, heartbeatTimer, () => {
    isPolling = false;
    clearInterval(pollingTimer);
  });

  logger.info("Worker started polling...");
}

main().catch(async (error) => {
  logger.error(error.message);
  await prisma.$disconnect();
  process.exit(1);
});