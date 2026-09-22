import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import NotificationRead from "../models/NotificationRead.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/admin/notifications?limit=30
// Presentation layer over the EXISTING Activity records — no new tracking
// data is created or read from anywhere else.
export async function getNotifications(req, res, next) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 50);
    const adminId = req.user._id;

    const [activities, readReceipts, unreadCount] = await Promise.all([
      Activity.find().populate("user", "name email").sort({ createdAt: -1 }).limit(limit),
      // Only need the ids of activities this admin has already read, scoped
      // to the ones we're about to show, to flag them cheaply.
      NotificationRead.find({ admin: adminId }).select("activity"),
      // True unread count is computed against ALL activities, not just the
      // limited/displayed set, so the badge stays accurate regardless of
      // the panel's display limit.
      Activity.countDocuments().then(async (total) => {
        const readTotal = await NotificationRead.countDocuments({ admin: adminId });
        return Math.max(total - readTotal, 0);
      }),
    ]);

    const readActivityIds = new Set(readReceipts.map((r) => r.activity.toString()));

    res.status(200).json({
      success: true,
      unreadCount,
      notifications: activities.map((a) => ({
        id: a._id,
        user: a.user ? { id: a.user._id, name: a.user.name, email: a.user.email } : null,
        action: a.action,
        metadata: a.metadata || {},
        createdAt: a.createdAt,
        read: readActivityIds.has(a._id.toString()),
      })),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/notifications/:id/read
export async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid activity id");
    }

    const activity = await Activity.findById(id).select("_id");
    if (!activity) {
      res.status(404);
      throw new Error("Activity not found");
    }

    // Upsert — calling this twice for the same activity is harmless
    // (unique index on admin+activity prevents duplicate receipts).
    await NotificationRead.updateOne(
      { admin: req.user._id, activity: id },
      { $setOnInsert: { admin: req.user._id, activity: id } },
      { upsert: true }
    );

    const [total, readTotal] = await Promise.all([
      Activity.countDocuments(),
      NotificationRead.countDocuments({ admin: req.user._id }),
    ]);

    res.status(200).json({ success: true, unreadCount: Math.max(total - readTotal, 0) });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/notifications/read-all
export async function markAllNotificationsRead(req, res, next) {
  try {
    const adminId = req.user._id;

    const [allActivityIds, existingReceipts] = await Promise.all([
      Activity.find().select("_id"),
      NotificationRead.find({ admin: adminId }).select("activity"),
    ]);

    const alreadyRead = new Set(existingReceipts.map((r) => r.activity.toString()));
    const toInsert = allActivityIds
      .filter((a) => !alreadyRead.has(a._id.toString()))
      .map((a) => ({ admin: adminId, activity: a._id }));

    if (toInsert.length > 0) {
      // ordered:false so one accidental duplicate (race condition) doesn't
      // abort the rest of the batch — the unique index makes duplicates
      // harmless no-ops either way.
      await NotificationRead.insertMany(toInsert, { ordered: false }).catch(() => {});
    }

    res.status(200).json({ success: true, unreadCount: 0 });
  } catch (error) {
    next(error);
  }
}
