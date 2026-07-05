import { api } from "./client";
import type { WorkerHealth } from "../types/worker";

export async function getWorkerHealth(queueId: string): Promise<WorkerHealth[]> {
  const response = await api.get("/workers/health", {
    params: {
      queueId,
    },
  });

  return response.data.data;
}

export async function markStaleWorkersOffline(): Promise<{
  markedOffline: number;
}> {
  const response = await api.patch("/workers/mark-stale-offline");
  return response.data.data;
}
export async function getWorkers(queueId: string) {
  const response = await api.get("/workers", {
    params: {
      queueId,
    },
  });

  return response.data.data;
}