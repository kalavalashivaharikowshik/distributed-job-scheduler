    import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { metricsService } from "./metrics.service";

export const metricsController = {
  async getSystemMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await metricsService.getSystemMetrics(req.user!.id);

      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  },

  async getQueueMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await metricsService.getQueueMetrics(
        req.user!.id,
        String(req.params.queueId)
      );

      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  },

  async getWorkerMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await metricsService.getWorkerMetrics(
        req.user!.id,
        String(req.params.workerId)
      );

      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  },
};