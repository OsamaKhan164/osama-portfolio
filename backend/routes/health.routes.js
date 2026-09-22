import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// GET /api/health — used to confirm the server is up and DB is connected
router.get("/", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];

  res.json({
    success: true,
    message: "API is running",
    database: dbStates[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

export default router;
