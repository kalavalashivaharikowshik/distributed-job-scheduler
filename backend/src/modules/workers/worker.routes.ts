import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { workerController } from "./worker.controller";

const router = Router();

router.use(authMiddleware);

router.post("/register", workerController.registerWorker);
router.post("/heartbeat", workerController.sendHeartbeat);

router.get("/", workerController.listWorkers);
router.get("/health", workerController.getWorkerHealth);
router.patch("/mark-stale-offline", workerController.markStaleWorkersOffline);

router.get("/:id/running-jobs", workerController.getRunningJobs);
router.get("/:id", workerController.getWorkerById);

router.patch("/:id/shutdown", workerController.markWorkerShuttingDown);
router.patch("/:id/offline", workerController.markWorkerOffline);

export const workerRoutes = router;