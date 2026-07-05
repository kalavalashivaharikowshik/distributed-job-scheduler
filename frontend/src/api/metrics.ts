import { api } from "./client";

export async function getSystemMetrics() {
  const response = await api.get("/metrics/system");
  return response.data.data;
}

export async function getQueueMetrics(queueId: string) {
  const response = await api.get(`/metrics/queue/${queueId}`);
  return response.data.data;
}

export async function getWorkerMetrics(workerId: string) {
  const response = await api.get(`/metrics/worker/${workerId}`);
  return response.data.data;
}