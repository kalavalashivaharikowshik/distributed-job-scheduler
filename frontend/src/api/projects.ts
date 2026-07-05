import { api } from "./client";
import type { Project } from "../types/project";

export async function getProjects(): Promise<Project[]> {
  const response = await api.get("/projects");
  return response.data.data;
}

export async function createProject(data: {
  name: string;
  description?: string;
  organizationId: string;
}): Promise<Project> {
  const response = await api.post("/projects", data);
  return response.data.data;
}

export async function deleteProject(id: string) {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
}