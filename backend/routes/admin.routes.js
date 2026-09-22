import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getUsers,
  getContacts,
  updateContactStatus,
  deleteContact,
  getActivities,
  deleteActivity,
  getStats,
} from "../controllers/admin.controller.js";
import {
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/adminProject.controller.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notification.controller.js";

const router = Router();

// Every route below requires a valid JWT AND role === "admin".
// Applied once here rather than per-route so it can't accidentally be
// left off a new admin route added later.
router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.get("/contacts", getContacts);
router.patch("/contacts/:id/status", updateContactStatus);
router.delete("/contacts/:id", deleteContact);
router.get("/activities", getActivities);
router.delete("/activities/:id", deleteActivity);
router.get("/projects", getAdminProjects);
router.post("/projects", createProject);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

// Notifications — a presentation layer over the Activity records above,
// not a second tracking system. See controllers/notification.controller.js.
router.get("/notifications", getNotifications);
router.post("/notifications/:id/read", markNotificationRead);
router.post("/notifications/read-all", markAllNotificationsRead);

export default router;
