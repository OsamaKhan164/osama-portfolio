import mongoose from "mongoose";

/**
 * This is deliberately NOT a second activity-tracking system. It records
 * zero information about what happened (no action type, no metadata, no
 * "who did it") — it only records "this admin has seen this activity",
 * as a read-receipt referencing the existing Activity collection's _id.
 *
 * The Activity model itself (models/Activity.js) remains the single
 * source of truth for what was tracked and stays fully immutable —
 * marking a notification read never writes to an Activity document.
 */
const notificationReadSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
  },
  { timestamps: true }
);

// One read-receipt per (admin, activity) pair — prevents duplicates and
// makes "has this admin read this activity" a simple existence check.
notificationReadSchema.index({ admin: 1, activity: 1 }, { unique: true });

export default mongoose.model("NotificationRead", notificationReadSchema);
