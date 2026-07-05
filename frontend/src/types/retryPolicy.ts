export type BackoffType = "FIXED" | "LINEAR" | "EXPONENTIAL";

export type RetryPolicy = {
  id: string;
  name: string;
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs?: number | null;
  backoffType: BackoffType;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};