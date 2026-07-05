import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
  organizationId: z.string().uuid("Invalid organization id"),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").optional(),
  description: z.string().optional(),
});