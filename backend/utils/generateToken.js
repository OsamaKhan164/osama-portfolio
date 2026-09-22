import jwt from "jsonwebtoken";

/**
 * Signs a JWT carrying the user's id and role. Secret and expiry come
 * from environment variables — never hardcoded.
 */
export default function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}
