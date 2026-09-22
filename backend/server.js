import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import projectRoutes from "./routes/project.routes.js";
import seedProjects from "./utils/seedProjects.js";

dotenv.config();

// Fail fast if a critical secret is missing — mirrors the existing
// MONGO_URI check in config/db.js. Never logs the actual secret value,
// only whether it's present.
if (!process.env.JWT_SECRET) {
  console.error(
    "JWT_SECRET is not defined in the environment. Refusing to start — " +
      "set JWT_SECRET in your .env file (see .env.example)."
  );
  process.exit(1);
}

const app = express();

// Connect to MongoDB before accepting traffic
connectDB();

// Safe to run on every startup — upserts by title, never duplicates,
// never overwrites an existing (possibly admin-edited) project. Mongoose
// buffers these operations until the connection above is actually ready.
seedProjects();

// Core middleware
app.use(
  helmet({
    // This backend only ever serves JSON — it never renders HTML for a
    // browser to apply a Content-Security-Policy to. The frontend is a
    // separately-hosted Vite/React app, so a CSP header here would do
    // nothing useful and risks confusing future maintainers. All of
    // Helmet's other protections (X-Content-Type-Options, X-Frame-Options,
    // HSTS, etc.) remain enabled.
    contentSecurityPolicy: false,
    // The frontend runs on a different origin/port and fetches this API
    // directly (already governed by the CORS config below) — this just
    // avoids the browser's separate Cross-Origin-Resource-Policy check
    // getting in the way of that legitimate cross-origin use.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
// Explicit, intentional body size limits (matches Express's previous
// implicit default of 100kb — now a deliberate, documented decision
// rather than something that could be loosened by accident later).
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);

// Later phases will add, e.g.:
// app.use("/api/skills", skillRoutes);

// 404 + centralized error handling — must be last
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
