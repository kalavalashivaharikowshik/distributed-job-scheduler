import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/api-error";

type CreateProjectInput = {
  name: string;
  description?: string;
  organizationId: string;
};

type UpdateProjectInput = {
  name?: string;
  description?: string;
};

export const projectService = {
  async createProject(userId: string, data: CreateProjectInput) {
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId,
        organizationId: data.organizationId,
      },
    });

    if (!membership) {
      throw new ApiError(403, "You do not belong to this organization");
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        organizationId: data.organizationId,
      },
    });

    return project;
  },

  async listProjects(userId: string) {
    const projects = await prisma.project.findMany({
      where: {
        organization: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return projects;
  },

  async getProjectById(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    return project;
  },

  async updateProject(userId: string, projectId: string, data: UpdateProjectInput) {
    const existingProject = await this.getProjectById(userId, projectId);

    const updatedProject = await prisma.project.update({
      where: {
        id: existingProject.id,
      },
      data,
    });

    return updatedProject;
  },

  async deleteProject(userId: string, projectId: string) {
    const existingProject = await this.getProjectById(userId, projectId);

    await prisma.project.delete({
      where: {
        id: existingProject.id,
      },
    });

    return {
      message: "Project deleted successfully",
    };
  },
};