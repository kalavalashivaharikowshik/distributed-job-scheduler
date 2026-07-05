import { z } from "zod";

export const registerWorkerSchema = z.object({
  name: z.string().min(2, "Worker name must be at least 2 characters"),
  queueId: z.string().uuid("Invalid queue id"),
  concurrency: z.number().int().min(1).max(100).optional(),
});

export const heartbeatSchema = z.object({
  workerId: z.string().uuid("Invalid worker id"),
});