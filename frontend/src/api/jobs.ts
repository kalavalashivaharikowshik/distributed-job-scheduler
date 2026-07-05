import { api } from "./client";
import type { Job, JobStatus } from "../types/job";

export async function getJobs(params: {
  queueId: string;
  status?: JobStatus | "";
  page?: number;
  limit?: number;
}): Promise<{
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  const cleanParams = {
    queueId: params.queueId,
    page: params.page,
    limit: params.limit,
    ...(params.status ? { status: params.status } : {}),
  };

  const response = await api.get("/jobs", {
    params: cleanParams,
  });

  return response.data.data;
}

export async function createJob(data: {
  name: string;
  type: "IMMEDIATE";
  payload: Record<string, unknown>;
  priority?: number;
  queueId: string;
}): Promise<Job> {
  const response = await api.post("/jobs", data);
  return response.data.data;
}

export async function cancelJob(id: string): Promise<Job> {
  const response = await api.patch(`/jobs/${id}/cancel`);
  return response.data.data;
}

export async function getJobById(id: string): Promise<Job> {
  const response = await api.get(`/jobs/${id}`);
  return response.data.data;
}

export async function getJobLogs(id: string) {
  const response = await api.get(`/jobs/${id}/logs`);
  return response.data.data;
}

export async function getJobExecutions(id: string) {
  const response = await api.get(`/jobs/${id}/executions`);
  return response.data.data;
}