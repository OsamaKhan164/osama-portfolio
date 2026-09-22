import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import logActivity from "../utils/logActivity.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    // Explicit type checks — non-string input (objects/arrays/numbers) is
    // treated as missing rather than being passed to .trim()/.length,
    // which could otherwise throw an uncaught type error instead of a
    // clean validation response.
    const safeName = typeof name === "string" ? name.trim() : "";
    const safeEmail = typeof email === "string" ? email.trim() : "";
    const safePassword = typeof password === "string" ? password : "";

    if (!safeName || !safeEmail || !safePassword) {
      res.status(400);
      throw new Error("Name, email and password are all required");
    }

    if (!EMAIL_RE.test(safeEmail)) {
      res.status(400);
      throw new Error("Please provide a valid email address");
    }

    if (safePassword.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const normalizedEmail = safeEmail.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409);
      throw new Error("An account with this email already exists");
    }

    const user = await User.create({
      name: safeName,
      email: normalizedEmail,
      password: safePassword, // hashed by the pre-save hook on the model
    });

    const token = generateToken(user);

    // Fire-and-forget: never awaited, never allowed to affect this response.
    logActivity({ userId: user._id, action: "REGISTER" });

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    const safeEmail = typeof email === "string" ? email.trim() : "";
    const safePassword = typeof password === "string" ? password : "";

    if (!safeEmail || !safePassword) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const normalizedEmail = safeEmail.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await user.comparePassword(safePassword);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user);

    // Fire-and-forget: never awaited, never allowed to affect this response.
    // No JWT/token is stored — only that a login happened.
    logActivity({ userId: user._id, action: "LOGIN" });

    res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me (protected)
export async function getMe(req, res, next) {
  try {
    // req.user is attached by the `protect` middleware
    res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
}
