import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/api-error";

type CreateRetryPolicyInput = {
  name: string;
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffType?: "FIXED" | "LINEAR" | "EXPONENTIAL";
  projectId: string;
};

type UpdateRetryPolicyInput = {
  name?: string;
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffType?: "FIXED" | "LINEAR" | "EXPONENTIAL";
};

export const retryPolicyService = {
  async createRetryPolicy(userId: string, data: CreateRetryPolicyInput) {
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        organization: {
          members: {
            some: { userId },
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const existingPolicy = await prisma.retryPolicy.findFirst({
      where: {
        projectId: data.projectId,
        name: data.name,
      },
    });

    if (existingPolicy) {
      throw new ApiError(409, "Retry policy with this name already exists");
    }

    return prisma.retryPolicy.create({
      data: {
        name: data.name,
        maxAttempts: data.maxAttempts,
        initialDelayMs: data.initialDelayMs,
        maxDelayMs: data.maxDelayMs,
        backoffType: data.backoffType,
        projectId: data.projectId,
      },
    });
  },

  async listRetryPolicies(userId: string, projectId: string) {
    if (!projectId) {
      throw new ApiError(400, "projectId query parameter is required");
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: { userId },
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    return prisma.retryPolicy.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getRetryPolicyById(userId: string, retryPolicyId: string) {
    const retryPolicy = await prisma.retryPolicy.findFirst({
      where: {
        id: retryPolicyId,
        project: {
          organization: {
            members: {
              some: { userId },
            },
          },
        },
      },
    });

    if (!retryPolicy) {
      throw new ApiError(404, "Retry policy not found");
    }

    return retryPolicy;
  },

  async updateRetryPolicy(
    userId: string,
    retryPolicyId: string,
    data: UpdateRetryPolicyInput
  ) {
    const existingPolicy = await this.getRetryPolicyById(userId, retryPolicyId);

    if (data.name) {
      const duplicatePolicy = await prisma.retryPolicy.findFirst({
        where: {
          projectId: existingPolicy.projectId,
          name: data.name,
          NOT: {
            id: retryPolicyId,
          },
        },
      });

      if (duplicatePolicy) {
        throw new ApiError(409, "Retry policy with this name already exists");
      }
    }

    return prisma.retryPolicy.update({
      where: { id: retryPolicyId },
      data,
    });
  },

  async deleteRetryPolicy(userId: string, retryPolicyId: string) {
    await this.getRetryPolicyById(userId, retryPolicyId);

    await prisma.retryPolicy.delete({
      where: { id: retryPolicyId },
    });

    return {
      message: "Retry policy deleted successfully",
    };
  },
};