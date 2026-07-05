import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { jobService } from "./job.service";
import { emitSocketEvent } from "../../socket";
import {
  createBatchJobSchema,
  createJobSchema,
  listJobsQuerySchema,
} from "./job.validation";

export const jobController = {
  async createJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createJobSchema.parse(req.body);
      const job = await jobService.createJob(req.user!.id, data);
      emitSocketEvent("job:created", job);
      

      return res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },

  async createBatchJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createBatchJobSchema.parse(req.body);

      const result = await jobService.createBatchJobs(req.user!.id, data);

      emitSocketEvent("job:batch-created", result);

      return res.status(201).json({
        success: true,
        message: "Batch jobs created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async listJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = listJobsQuerySchema.parse(req.query);
      const result = await jobService.listJobs(req.user!.id, query);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getJobById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const job = await jobService.getJobById(req.user!.id, String(req.params.id));

      return res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },

  async getJobLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const logs = await jobService.getJobLogs(req.user!.id, String(req.params.id));

      return res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  },

  async getJobExecutions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const executions = await jobService.getJobExecutions(
        req.user!.id,
        String(req.params.id)
      );

      return res.status(200).json({
        success: true,
        data: executions,
      });
    } catch (error) {
      next(error);
    }
  },

  async cancelJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const job = await jobService.cancelJob(req.user!.id, String(req.params.id));

      return res.status(200).json({
        success: true,
        message: "Job cancelled successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },
};