import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { dlqController } from "./dlq.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", dlqController.listEntries);
router.get("/:id", dlqController.getEntryById);
router.patch("/:id/retry", dlqController.retryEntry);

export const dlqRoutes = router;