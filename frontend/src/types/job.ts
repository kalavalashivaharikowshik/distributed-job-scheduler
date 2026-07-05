export type JobStatus =
  | "QUEUED"
  | "SCHEDULED"
  | "CLAIMED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "RETRYING"
  | "CANCELLED"
  | "DEAD_LETTER";

export type JobType =
  | "IMMEDIATE"
  | "DELAYED"
  | "SCHEDULED"
  | "RECURRING"
  | "BATCH";

export type Job = {
  id: string;
  name: string;
  type: JobType;
  status: JobStatus;
  payload: Record<string, unknown>;
  priority: number;
  maxAttempts?: number | null;
  attemptsMade: number;
  scheduledAt?: string | null;
  nextRunAt?: string | null;
  cronExpression?: string | null;
  batchId?: string | null;
  queueId: string;
  claimedByWorkerId?: string | null;
  claimedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};