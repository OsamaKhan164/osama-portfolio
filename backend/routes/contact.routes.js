import { Router } from "express";
import { createContact } from "../controllers/contact.controller.js";
import { optionalAuth } from "../middleware/auth.js";
import { contactLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public — guests can submit without an account. If a valid JWT is
// present, optionalAuth attaches req.user so the submission is associated
// with that account; otherwise it proceeds as a guest submission.
// Rate limiting stays active either way (a second layer against flooding,
// now more important since this is no longer auth-gated).
router.post("/", contactLimiter, optionalAuth, createContact);

export default router;
