import mongoose from "mongoose";
import logActivity from "../utils/logActivity.js";

// Only these are ever reachable from the client. REGISTER, LOGIN and
// CONTACT_SUBMIT are logged internally by their own controllers and are
// intentionally excluded here — this is not a general-purpose activity
// endpoint, it's a narrow one for actions the client actually observes.
const CLIENT_LOGGABLE_ACTIONS = [
  "PROJECT_VIEW",
  "GITHUB_CLICK",
  "LIVE_DEMO_CLICK",
  "RESUME_ACCESS",
];

const ALLOWED_METADATA_KEYS = ["projectId", "projectTitle"];

function pickMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return {};
  const clean = {};
  for (const key of ALLOWED_METADATA_KEYS) {
    if (typeof metadata[key] === "string" && metadata[key].trim()) {
      clean[key] = metadata[key].trim().slice(0, 200);
    }
  }
  return clean;
}

// POST /api/activity (protected)
export async function recordClientActivity(req, res, next) {
  try {
    const { action, projectId, metadata } = req.body || {};

    if (!CLIENT_LOGGABLE_ACTIONS.includes(action)) {
      res.status(400);
      throw new Error("Invalid or unsupported activity action");
    }

    // Only accept projectId if it's actually a well-formed ObjectId — never
    // trusted for anything beyond "does this look like an id", since it's
    // just a reference and an invalid/stale one is harmless (it simply
    // won't populate to a real Project on read).
    const validProjectId =
      typeof projectId === "string" && mongoose.Types.ObjectId.isValid(projectId)
        ? projectId
        : undefined;

    // logActivity never throws — a DB hiccup here still returns success
    // to the client, since activity logging is not user-facing functionality.
    await logActivity({
      userId: req.user._id,
      action,
      projectId: validProjectId,
      metadata: pickMetadata(metadata),
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
}
