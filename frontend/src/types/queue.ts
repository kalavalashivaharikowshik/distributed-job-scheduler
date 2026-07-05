export type QueueStatus = "ACTIVE" | "PAUSED";

export type Queue = {
  id: string;
  name: string;
  description?: string | null;
  priority: number;
  concurrencyLimit: number;
  status: QueueStatus;
  projectId: string;
  retryPolicyId?: string | null;
  createdAt: string;
  updatedAt: string;
};