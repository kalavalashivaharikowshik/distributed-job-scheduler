import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { queueService } from "./queue.service";
import { createQueueSchema, updateQueueSchema } from "./queue.validation";
import { attachRetryPolicySchema } from "../retry-policies/retry-policy.validation";

type IdParam = {
  id: string;
};

export const queueController = {
  async createQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createQueueSchema.parse(req.body);
      const queue = await queueService.createQueue(req.user!.id, data);

      return res.status(201).json({
        success: true,
        message: "Queue created successfully",
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  },

  async listQueues(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const queues = await queueService.listQueues(req.user!.id, projectId);

      return res.status(200).json({
        success: true,
        data: queues,
      });
    } catch (error) {
      next(error);
    }
  },

  async getQueueById(req: AuthRequest & { params: IdParam }, res: Response, next: NextFunction) {
    try {
      const queue = await queueService.getQueueById(req.user!.id, req.params.id);

      return res.status(200).json({
        success: true,
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateQueue(req: AuthRequest & { params: IdParam }, res: Response, next: NextFunction) {
    try {
      const data = updateQueueSchema.parse(req.body);
      const queue = await queueService.updateQueue(
        req.user!.id,
        req.params.id,
        data
      );

      return res.status(200).json({
        success: true,
        message: "Queue updated successfully",
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  },

  async pauseQueue(req: AuthRequest & { params: IdParam }, res: Response, next: NextFunction) {
    try {
      const queue = await queueService.pauseQueue(req.user!.id, req.params.id);

      return res.status(200).json({
        success: true,
        message: "Queue paused successfully",
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  },

  async resumeQueue(req: AuthRequest & { params: IdParam }, res: Response, next: NextFunction) {
    try {
      const queue = await queueService.resumeQueue(req.user!.id, req.params.id);

      return res.status(200).json({
        success: true,
        message: "Queue resumed successfully",
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  },

  async attachRetryPolicy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const data = attachRetryPolicySchema.parse(req.body);

        const queue = await queueService.attachRetryPolicy(
        req.user!.id,
        String(req.params.id),
        data.retryPolicyId
        );

        return res.status(200).json({
        success: true,
        message: "Retry policy attached to queue successfully",
        data: queue,
        });
    } catch (error) {
        next(error);
    }
    },
  
  async getQueueStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await queueService.getQueueStatistics(
        req.user!.id,
        String(req.params.id),
      );

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
},

  async deleteQueue(req: AuthRequest & { params: IdParam }, res: Response, next: NextFunction) {
    try {
      const result = await queueService.deleteQueue(req.user!.id, req.params.id);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};