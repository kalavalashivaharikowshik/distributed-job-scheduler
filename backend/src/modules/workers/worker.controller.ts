import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { workerService } from "./worker.service";
import { heartbeatSchema, registerWorkerSchema } from "./worker.validation";

export const workerController = {
  async registerWorker(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = registerWorkerSchema.parse(req.body);
      const worker = await workerService.registerWorker(req.user!.id, data);

      return res.status(201).json({
        success: true,
        message: "Worker registered successfully",
        data: worker,
      });
    } catch (error) {
      next(error);
    }
  },

  async sendHeartbeat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = heartbeatSchema.parse(req.body);

      const worker = await workerService.sendHeartbeat(
        req.user!.id,
        data.workerId
      );

      return res.status(200).json({
        success: true,
        message: "Worker heartbeat recorded successfully",
        data: worker,
      });
    } catch (error) {
      next(error);
    }
  },

  async listWorkers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const queueId = req.query.queueId as string;
      const workers = await workerService.listWorkers(req.user!.id, queueId);

      return res.status(200).json({
        success: true,
        data: workers,
      });
    } catch (error) {
      next(error);
    }
  },

  async getRunningJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const jobs = await workerService.getRunningJobs(
        req.user!.id,
        String(req.params.id)
        );

        return res.status(200).json({
        success: true,
        data: jobs,
        });
    } catch (error) {
        next(error);
    }
    },

    async getWorkerHealth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const queueId = req.query.queueId as string;

        const health = await workerService.getWorkerHealth(req.user!.id, queueId);

        return res.status(200).json({
        success: true,
        data: health,
        });
    } catch (error) {
        next(error);
    }
    },

    async markStaleWorkersOffline(
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) {
    try {
        const result = await workerService.markStaleWorkersOffline(req.user!.id);

        return res.status(200).json({
        success: true,
        message: "Stale workers marked offline successfully",
        data: result,
        });
    } catch (error) {
        next(error);
    }
    },

  async getWorkerById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const worker = await workerService.getWorkerById(
        req.user!.id,
        String(req.params.id)
      );

      return res.status(200).json({
        success: true,
        data: worker,
      });
    } catch (error) {
      next(error);
    }
  },

  async markWorkerShuttingDown(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const worker = await workerService.markWorkerShuttingDown(
        req.user!.id,
        String(req.params.id)
      );

      return res.status(200).json({
        success: true,
        message: "Worker marked as shutting down",
        data: worker,
      });
    } catch (error) {
      next(error);
    }
  },

  async markWorkerOffline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const worker = await workerService.markWorkerOffline(
        req.user!.id,
        String(req.params.id)
      );

      return res.status(200).json({
        success: true,
        message: "Worker marked offline successfully",
        data: worker,
      });
    } catch (error) {
      next(error);
    }
  },
};