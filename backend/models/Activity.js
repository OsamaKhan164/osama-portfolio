import mongoose from "mongoose";

// Controlled list — prevents arbitrary action strings from ever reaching
// the database, whether from a bug or a malicious client.
export const ACTIVITY_ACTIONS = [
  "REGISTER",
  "LOGIN",
  "PROJECT_VIEW",
  "GITHUB_CLICK",
  "LIVE_DEMO_CLICK",
  "RESUME_ACCESS",
  "CONTACT_SUBMIT",
];

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ACTIVITY_ACTIONS,
    },
    // No Project model exists yet — this stays optional/unset for now.
    // Kept here so a future Project collection can be linked without a
    // migration; until then, project identity lives in `metadata`.
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      default: {},
    },
  },
  { timestamps: true }
);

// Supports the future Admin Panel: "this user's recent activity",
// "recent activity of a given type", and a plain activity feed.
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ action: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

export default mongoose.model("Activity", activitySchema);
