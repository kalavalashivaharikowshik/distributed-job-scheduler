import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { projectService } from "./project.service";
import { createProjectSchema, updateProjectSchema } from "./project.validation";

export const projectController = {
  async createProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createProjectSchema.parse(req.body);
      const project = await projectService.createProject(req.user!.id, data);

      return res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  async listProjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.listProjects(req.user!.id);

      return res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProjectById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getProjectById(
        req.user!.id,
        String(req.params.id)
      );

      return res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateProjectSchema.parse(req.body);

      const project = await projectService.updateProject(
        req.user!.id,
        String(req.params.id),
        data
      );

      return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await projectService.deleteProject(
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