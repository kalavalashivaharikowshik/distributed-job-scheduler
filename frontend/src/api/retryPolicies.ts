import { api } from "./client";
import type { BackoffType, RetryPolicy } from "../types/retryPolicy";

export async function getRetryPolicies(
  projectId: string
): Promise<RetryPolicy[]> {
  const response = await api.get("/retry-policies", {
    params: {
      projectId,
    },
  });

  return response.data.data;
}

export async function createRetryPolicy(data: {
  name: string;
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs?: number;
  backoffType: BackoffType;
  projectId: string;
}): Promise<RetryPolicy> {
  const response = await api.post("/retry-policies", data);
  return response.data.data;
}

export async function deleteRetryPolicy(id: string) {
  const response = await api.delete(`/retry-policies/${id}`);
  return response.data;
}