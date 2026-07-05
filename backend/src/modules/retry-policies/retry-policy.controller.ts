import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { retryPolicyService } from "./retry-policy.service";
import {
  createRetryPolicySchema,
  updateRetryPolicySchema,
} from "./retry-policy.validation";

export const retryPolicyController = {
  async createRetryPolicy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createRetryPolicySchema.parse(req.body);

      const retryPolicy = await retryPolicyService.createRetryPolicy(
        req.user!.id,
        data
      );

      return res.status(201).json({
        success: true,
        message: "Retry policy created successfully",
        data: retryPolicy,
      });
    } catch (error) {
      next(error);
    }
  },

  async listRetryPolicies(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;

      const retryPolicies = await retryPolicyService.listRetryPolicies(
        req.user!.id,
        projectId
      );

      return res.status(200).json({
        success: true,
        data: retryPolicies,
      });
    } catch (error) {
      next(error);
    }
  },

  async getRetryPolicyById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const retryPolicy = await retryPolicyService.getRetryPolicyById(
        req.user!.id,
        String(req.params.id)
      );

      return res.status(200).json({
        success: true,
        data: retryPolicy,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateRetryPolicy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateRetryPolicySchema.parse(req.body);

      const retryPolicy = await retryPolicyService.updateRetryPolicy(
        req.user!.id,
        String(req.params.id),
        data
      );

      return res.status(200).json({
        success: true,
        message: "Retry policy updated successfully",
        data: retryPolicy,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteRetryPolicy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await retryPolicyService.deleteRetryPolicy(
        req.user!.id,
        String(req.params.id)
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};