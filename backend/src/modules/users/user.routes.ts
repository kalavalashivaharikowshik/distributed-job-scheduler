import { Router } from "express";
import { authMiddleware, AuthRequest } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, (req: AuthRequest, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
});

export const userRoutes = router;