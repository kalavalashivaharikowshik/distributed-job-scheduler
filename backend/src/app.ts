import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorMiddleware } from "./middlewares/error.middleware";
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/users/user.routes";
import { projectRoutes } from "./modules/projects/project.routes";
import { queueRoutes } from "./modules/queues/queue.routes";
import { retryPolicyRoutes } from "./modules/retry-policies/retry-policy.routes";
import { jobRoutes } from "./modules/jobs/job.routes";
import { schedulerRoutes } from "./modules/scheduler/scheduler.routes";
import { workerRoutes } from "./modules/workers/worker.routes";
import { dlqRoutes } from "./modules/dlq/dlq.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { metricsRoutes } from "./modules/metrics/metrics.routes";
import { apiRateLimiter, authRateLimiter } from "./middlewares/rate-limit.middleware";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "distributed-job-scheduler-api",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/retry-policies", retryPolicyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/scheduler", schedulerRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/dlq", dlqRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api", apiRateLimiter);
app.use("/api/auth", authRateLimiter);

app.use(errorMiddleware);