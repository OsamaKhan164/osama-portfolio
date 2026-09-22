import { rateLimit } from "express-rate-limit";

/**
 * Applied only to POST /api/auth/login and POST /api/auth/register —
 * not to the whole API, and not even to GET /api/auth/me. Generous enough
 * that normal manual testing/development isn't affected, but enough to
 * blunt brute-force/credential-stuffing and automated fake-signup abuse.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

/**
 * Applied only to POST /api/contacts. Contact submission already requires
 * authentication, so this is a second layer against a single account (or
 * shared IP) flooding the contact pipeline.
 */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // 10 submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages sent. Please try again later.",
  },
});
