import { z } from "zod";

const payloadSchema = z.record(z.string(), z.any());

export const createJobSchema = z.object({
  name: z.string().min(2, "Job name must be at least 2 characters"),
  type: z.enum(["IMMEDIATE", "DELAYED", "SCHEDULED", "RECURRING"]).optional(),
  payload: payloadSchema,
  priority: z.number().int().min(0).optional(),
  queueId: z.string().uuid("Invalid queue id"),
  scheduledAt: z.string().datetime().optional(),
  delayMs: z.number().int().min(1).optional(),
  cronExpression: z.string().optional(),
});

export const createBatchJobSchema = z.object({
  queueId: z.string().uuid("Invalid queue id"),
  jobs: z.array(
    z.object({
      name: z.string().min(2),
      payload: payloadSchema,
      priority: z.number().int().min(0).optional(),
    })
  ).min(1, "At least one job is required"),
});

export const listJobsQuerySchema = z.object({
  queueId: z.string().uuid("Invalid queue id"),
  status: z.enum([
    "QUEUED",
    "SCHEDULED",
    "CLAIMED",
    "RUNNING",
    "COMPLETED",
    "FAILED",
    "RETRYING",
    "CANCELLED",
    "DEAD_LETTER",
  ]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});