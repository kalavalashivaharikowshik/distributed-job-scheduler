import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { projectController } from "./project.controller";
import { requireOrgRole } from "../../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", projectController.createProject);
router.get("/", projectController.listProjects);
router.get("/:id", projectController.getProjectById);
router.patch("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);
router.post("/", requireOrgRole("ADMIN"), projectController.createProject);
router.patch("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

export const projectRoutes = router;