import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { schedulerController } from "./scheduler.controller";

const router = Router();

router.use(authMiddleware);

router.post("/run", schedulerController.runScheduler);

export const schedulerRoutes = router;