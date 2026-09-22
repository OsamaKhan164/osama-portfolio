import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { recordClientActivity } from "../controllers/activity.controller.js";

const router = Router();

// Authenticated only — and even then, restricted to a small action
// whitelist inside the controller. No arbitrary activity submission,
// no reading of activity records here (that's the future admin API).
router.post("/", protect, recordClientActivity);

export default router;
