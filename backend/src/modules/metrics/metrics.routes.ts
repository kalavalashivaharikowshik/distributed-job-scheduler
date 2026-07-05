import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { metricsController } from "./metrics.controller";

const router = Router();

router.use(authMiddleware);

router.get("/system", metricsController.getSystemMetrics);
router.get("/queue/:queueId", metricsController.getQueueMetrics);
router.get("/worker/:workerId", metricsController.getWorkerMetrics);

export const metricsRoutes = router;