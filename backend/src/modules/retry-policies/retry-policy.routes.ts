import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { retryPolicyController } from "./retry-policy.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", retryPolicyController.createRetryPolicy);
router.get("/", retryPolicyController.listRetryPolicies);
router.get("/:id", retryPolicyController.getRetryPolicyById);
router.patch("/:id", retryPolicyController.updateRetryPolicy);
router.delete("/:id", retryPolicyController.deleteRetryPolicy);

export const retryPolicyRoutes = router;