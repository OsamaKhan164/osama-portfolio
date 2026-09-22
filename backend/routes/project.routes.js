import { Router } from "express";
import { getPublicProjects, getPublicProject } from "../controllers/project.controller.js";

const router = Router();

// Public — no auth required to browse the project listing or a single
// project's public details (title, description, tech, URLs).
router.get("/", getPublicProjects);
router.get("/:id", getPublicProject);

export default router;
