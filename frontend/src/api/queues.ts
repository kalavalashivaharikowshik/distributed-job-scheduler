import { api } from "./client";
import type { Queue } from "../types/queue";

export async function getQueues(projectId: string): Promise<Queue[]> {
  const response = await api.get(`/queues?projectId=${projectId}`);
  return response.data.data;
}

export async function createQueue(data: {
  name: string;
  description?: string;
  priority?: number;
  concurrencyLimit?: number;
  projectId: string;
}): Promise<Queue> {
  const response = await api.post("/queues", data);
  return response.data.data;
}

export async function pauseQueue(id: string): Promise<Queue> {
  const response = await api.patch(`/queues/${id}/pause`);
  return response.data.data;
}

export async function resumeQueue(id: string): Promise<Queue> {
  const response = await api.patch(`/queues/${id}/resume`);
  return response.data.data;
}

export async function deleteQueue(id: string) {
  const response = await api.delete(`/queues/${id}`);
  return response.data;
}
export async function getQueueById(id: string): Promise<Queue> {
  const response = await api.get(`/queues/${id}`);
  return response.data.data;
}

export async function getQueueStats(id: string) {
  const response = await api.get(`/queues/${id}/stats`);
  return response.data.data;
}