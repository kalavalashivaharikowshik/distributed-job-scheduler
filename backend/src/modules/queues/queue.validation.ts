import { z } from "zod";

export const createQueueSchema = z.object({
  name: z.string().min(2, "Queue name must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.number().int().min(0).optional(),
  concurrencyLimit: z.number().int().min(1).max(100).optional(),
  projectId: z.string().uuid("Invalid project id"),
});

export const updateQueueSchema = z.object({
  name: z.string().min(2, "Queue name must be at least 2 characters").optional(),
  description: z.string().optional(),
  priority: z.number().int().min(0).optional(),
  concurrencyLimit: z.number().int().min(1).max(100).optional(),
});