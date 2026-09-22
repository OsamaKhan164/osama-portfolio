import mongoose from "mongoose";
import User from "../models/User.js";
import Contact from "../models/Contact.js";
import Activity from "../models/Activity.js";
import Project from "../models/Project.js";

const CONTACT_STATUSES = ["new", "read", "replied"];

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/admin/users
export async function getUsers(req, res, next) {
  try {
    // .select("-password") is defensive; the schema already excludes
    // password by default (select: false), but this keeps the contract
    // explicit even if that default ever changes.
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/contacts
export async function getContacts(req, res, next) {
  try {
    const contacts = await Contact.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts: contacts.map((c) => ({
        id: c._id,
        user: c.user ? { id: c.user._id, name: c.user.name, email: c.user.email } : null,
        name: c.name,
        email: c.email,
        subject: c.subject,
        message: c.message,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/contacts/:id/status
export async function updateContactStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid contact id");
    }

    if (!CONTACT_STATUSES.includes(status)) {
      res.status(400);
      throw new Error(`Status must be one of: ${CONTACT_STATUSES.join(", ")}`);
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      res.status(404);
      throw new Error("Contact message not found");
    }

    contact.status = status;
    await contact.save();

    res.status(200).json({
      success: true,
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        status: contact.status,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/contacts/:id
export async function deleteContact(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid contact id");
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      res.status(404);
      throw new Error("Contact message not found");
    }

    await contact.deleteOne();

    res.status(200).json({ success: true, message: "Message deleted." });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/activities?page=1&limit=20
export async function getActivities(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      activities: activities.map((a) => ({
        id: a._id,
        user: a.user ? { id: a.user._id, name: a.user.name, email: a.user.email } : null,
        action: a.action,
        project: a.project || null,
        metadata: a.metadata || {},
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/activities/:id
export async function deleteActivity(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid activity id");
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      res.status(404);
      throw new Error("Activity not found");
    }

    await activity.deleteOne();

    res.status(200).json({ success: true, message: "Activity deleted." });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/stats
export async function getStats(req, res, next) {
  try {
    const [totalUsers, totalContacts, totalActivities, totalProjects, recentActivities] =
      await Promise.all([
        User.countDocuments(),
        Contact.countDocuments(),
        Activity.countDocuments(),
        Project.countDocuments(),
        Activity.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalContacts,
        totalActivities,
        totalProjects,
      },
      recentActivities: recentActivities.map((a) => ({
        id: a._id,
        user: a.user ? { id: a.user._id, name: a.user.name, email: a.user.email } : null,
        action: a.action,
        project: a.project || null,
        metadata: a.metadata || {},
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}
