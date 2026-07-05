export type WorkerStatus = "ONLINE" | "OFFLINE" | "SHUTTING_DOWN";

export type WorkerHealth = {
  id: string;
  name: string;
  status: WorkerStatus;
  concurrency: number;
  lastHeartbeatAt?: string | null;
  heartbeatAgeMs?: number | null;
  runningJobs: number;
  isHealthy: boolean;
};