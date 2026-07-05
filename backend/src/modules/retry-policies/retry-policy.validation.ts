import { z } from "zod";

export const createRetryPolicySchema = z.object({
  name: z.string().min(2, "Retry policy name must be at least 2 characters"),
  maxAttempts: z.number().int().min(1).max(20).optional(),
  initialDelayMs: z.number().int().min(0).optional(),
  maxDelayMs: z.number().int().min(1).optional(),
  backoffType: z.enum(["FIXED", "LINEAR", "EXPONENTIAL"]).optional(),
  projectId: z.string().uuid("Invalid project id"),
});

export const updateRetryPolicySchema = z.object({
  name: z.string().min(2, "Retry policy name must be at least 2 characters").optional(),
  maxAttempts: z.number().int().min(1).max(20).optional(),
  initialDelayMs: z.number().int().min(0).optional(),
  maxDelayMs: z.number().int().min(1).optional(),
  backoffType: z.enum(["FIXED", "LINEAR", "EXPONENTIAL"]).optional(),
});

export const attachRetryPolicySchema = z.object({
  retryPolicyId: z.string().uuid("Invalid retry policy id").nullable(),
});