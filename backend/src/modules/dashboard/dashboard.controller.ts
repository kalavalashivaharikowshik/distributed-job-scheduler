import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { dashboardService } from "./dashboard.service";

export const dashboardController = {
  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const overview = await dashboardService.getOverview(req.user!.id);

      return res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  },
};