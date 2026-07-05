import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { dlqService } from "./dlq.service";

export const dlqController = {
  async listEntries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const queueId = req.query.queueId as string;
      const entries = await dlqService.listEntries(req.user!.id, queueId);

      return res.status(200).json({
        success: true,
        data: entries,
      });
    } catch (error) {
      next(error);
    }
  },

  async getEntryById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entry = await dlqService.getEntryById(req.user!.id, req.params.id as string);

      return res.status(200).json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  },

  async retryEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const job = await dlqService.retryEntry(req.user!.id, req.params.id as string);

      return res.status(200).json({
        success: true,
        message: "Job retried from Dead Letter Queue successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },
};