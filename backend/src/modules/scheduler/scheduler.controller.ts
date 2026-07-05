import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { schedulerService } from "./scheduler.service";

export const schedulerController = {
  async runScheduler(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await schedulerService.processDueJobs();

      return res.status(200).json({
        success: true,
        message: "Scheduler processed due jobs successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};