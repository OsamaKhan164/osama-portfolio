import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Verifies "Authorization: Bearer <token>", attaches the authenticated
 * user (minus password) to req.user, and rejects missing/invalid/expired
 * tokens. Every protected route/controller uses this.
 */
export async function protect(req, res, next) {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized — no token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      return next(new Error("Not authorized — user no longer exists"));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    if (error.name === "TokenExpiredError") {
      return next(new Error("Not authorized — token expired"));
    }
    return next(new Error("Not authorized — invalid token"));
  }
}

/**
 * Like `protect`, but never blocks the request. If a valid
 * "Authorization: Bearer <token>" is present, req.user is attached exactly
 * as `protect` would; if it's missing, malformed, or invalid/expired,
 * the request simply continues with req.user left undefined (guest).
 * Used only for routes that must work for both guests and logged-in
 * users (currently: contact submission).
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch {
    // Invalid/expired token on a public route — treat as a guest rather
    // than rejecting the request; this route doesn't require auth at all.
  }

  next();
}

/**
 * Role gate for future admin-only routes, e.g. router.get("/", protect, authorize("admin"), ...).
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("Forbidden — insufficient permissions"));
    }
    next();
  };
}
