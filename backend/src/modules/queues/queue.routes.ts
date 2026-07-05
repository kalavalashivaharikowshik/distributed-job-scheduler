import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { queueController } from "./queue.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", queueController.createQueue);
router.get("/", queueController.listQueues);
router.get("/:id/stats", queueController.getQueueStatistics);
router.get("/:id", queueController.getQueueById);
router.patch("/:id", queueController.updateQueue);
router.patch("/:id/pause", queueController.pauseQueue);
router.patch("/:id/resume", queueController.resumeQueue);
router.patch("/:id/retry-policy", queueController.attachRetryPolicy);
router.delete("/:id", queueController.deleteQueue);

export const queueRoutes = router;