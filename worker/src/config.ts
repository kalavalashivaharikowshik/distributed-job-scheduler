import dotenv from "dotenv";

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL || "",
  workerName: process.env.WORKER_NAME || "worker-1",
  queueId: process.env.QUEUE_ID || "",
  concurrency: Number(process.env.WORKER_CONCURRENCY || 1),
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 2000),
  heartbeatIntervalMs: Number(process.env.HEARTBEAT_INTERVAL_MS || 10000),
};