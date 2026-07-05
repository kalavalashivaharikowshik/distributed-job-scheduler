import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.use(authMiddleware);

router.get("/overview", dashboardController.getOverview);

export const dashboardRoutes = router;