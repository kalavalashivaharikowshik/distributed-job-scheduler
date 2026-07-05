import { prisma } from "./prisma";
import { logger } from "./logger";

export function setupGracefulShutdown(
  workerId: string,
  heartbeatTimer: NodeJS.Timeout,
  stopPolling: () => void
) {
  async function shutdown(signal: string) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    stopPolling();
    clearInterval(heartbeatTimer);

    await prisma.worker.update({
      where: { id: workerId },
      data: {
        status: "SHUTTING_DOWN",
      },
    });

    logger.info("Waiting 5 seconds for running jobs to finish...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await prisma.worker.update({
      where: { id: workerId },
      data: {
        status: "OFFLINE",
        stoppedAt: new Date(),
      },
    });

    await prisma.$disconnect();

    logger.info("Worker stopped safely");
    process.exit(0);
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}