import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { jobController } from "./job.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", jobController.createJob);
router.post("/batch", jobController.createBatchJobs);
router.get("/", jobController.listJobs);
router.get("/:id/logs", jobController.getJobLogs);
router.get("/:id/executions", jobController.getJobExecutions);
router.get("/:id", jobController.getJobById);
router.patch("/:id/cancel", jobController.cancelJob);

export const jobRoutes = router;