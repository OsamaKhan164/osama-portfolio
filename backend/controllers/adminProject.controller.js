import mongoose from "mongoose";
import Project, { PROJECT_STATUSES } from "../models/Project.js";

const URL_RE = /^https?:\/\/.+/i;

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function sanitizeProject(p) {
  return {
    id: p._id,
    title: p.title,
    description: p.description,
    image: p.image,
    technologies: p.technologies,
    githubUrl: p.githubUrl,
    liveUrl: p.liveUrl,
    featured: p.featured,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/**
 * Validates and normalizes incoming project fields.
 * `partial: true` (used for updates) only validates fields that are
 * actually present in the request body, so a PUT can update just one field
 * without being forced to resend everything.
 */
function validateProjectInput(body, { partial = false } = {}) {
  const errors = {};
  const clean = {};
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has("title")) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) errors.title = "Title is required.";
    else if (title.length > 150) errors.title = "Title is too long.";
    else clean.title = title;
  }

  if (!partial || has("description")) {
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (!description) errors.description = "Description is required.";
    else if (description.length > 2000) errors.description = "Description is too long.";
    else clean.description = description;
  }

  if (has("image")) {
    const image = typeof body.image === "string" ? body.image.trim() : "";
    if (image.length > 500) errors.image = "Image URL is too long.";
    else clean.image = image;
  }

  if (has("technologies")) {
    if (!Array.isArray(body.technologies)) {
      errors.technologies = "Technologies must be an array.";
    } else {
      clean.technologies = body.technologies
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter(Boolean)
        .slice(0, 20);
    }
  }

  if (has("githubUrl")) {
    const githubUrl = typeof body.githubUrl === "string" ? body.githubUrl.trim() : "";
    if (githubUrl && !URL_RE.test(githubUrl)) {
      errors.githubUrl = "GitHub URL must be a valid http(s) URL.";
    } else {
      clean.githubUrl = githubUrl;
    }
  }

  if (has("liveUrl")) {
    const liveUrl = typeof body.liveUrl === "string" ? body.liveUrl.trim() : "";
    if (liveUrl && !URL_RE.test(liveUrl)) {
      errors.liveUrl = "Live Demo URL must be a valid http(s) URL.";
    } else {
      clean.liveUrl = liveUrl;
    }
  }

  if (has("featured")) {
    if (typeof body.featured !== "boolean") errors.featured = "Featured must be true or false.";
    else clean.featured = body.featured;
  }

  if (has("status")) {
    if (!PROJECT_STATUSES.includes(body.status)) {
      errors.status = `Status must be one of: ${PROJECT_STATUSES.join(", ")}.`;
    } else {
      clean.status = body.status;
    }
  }

  return { errors, clean };
}

// GET /api/admin/projects
export async function getAdminProjects(req, res, next) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: projects.length,
      projects: projects.map(sanitizeProject),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/projects
export async function createProject(req, res, next) {
  try {
    const { errors, clean } = validateProjectInput(req.body || {});

    if (Object.keys(errors).length > 0) {
      res.status(400);
      return res.json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const project = await Project.create({
      title: clean.title,
      description: clean.description,
      image: clean.image || "",
      technologies: clean.technologies || [],
      githubUrl: clean.githubUrl || "",
      liveUrl: clean.liveUrl || "",
      featured: clean.featured ?? false,
      status: clean.status || "active",
    });

    res.status(201).json({ success: true, project: sanitizeProject(project) });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/projects/:id
export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid project id");
    }

    const { errors, clean } = validateProjectInput(req.body || {}, { partial: true });

    if (Object.keys(errors).length > 0) {
      res.status(400);
      return res.json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const project = await Project.findById(id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    Object.assign(project, clean);
    await project.save();

    res.status(200).json({ success: true, project: sanitizeProject(project) });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/projects/:id
export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid project id");
    }

    const project = await Project.findById(id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    // Only this Project document is removed. Activity records referencing
    // it (via the `project` ObjectId field or metadata.projectId/Title
    // snapshots) are intentionally left untouched — activity history must
    // stay valid and readable even after the project it refers to is gone.
    await project.deleteOne();

    res.status(200).json({ success: true, message: "Project deleted." });
  } catch (error) {
    next(error);
  }
}
