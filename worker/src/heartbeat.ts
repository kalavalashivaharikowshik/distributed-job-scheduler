import { prisma } from "./prisma";
import { logger } from "./logger";

export async function sendHeartbeat(workerId: string) {
  const now = new Date();

  await prisma.worker.update({
    where: { id: workerId },
    data: {
      status: "ONLINE",
      lastHeartbeatAt: now,
    },
  });

  await prisma.workerHeartbeat.create({
    data: {
      workerId,
    },
  });

  logger.info(`Heartbeat sent for worker ${workerId}`);
}

export function startHeartbeat(workerId: string, intervalMs: number) {
  const timer = setInterval(async () => {
    try {
      await sendHeartbeat(workerId);
    } catch (error) {
      logger.error(`Heartbeat failed: ${(error as Error).message}`);
    }
  }, intervalMs);

  return timer;
}