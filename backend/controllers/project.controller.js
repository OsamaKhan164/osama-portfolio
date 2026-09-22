import mongoose from "mongoose";
import Project from "../models/Project.js";

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

// GET /api/projects (public)
export async function getPublicProjects(req, res, next) {
  try {
    // Only published projects are ever visible publicly — "draft" is a
    // pre-publish state, not merely hidden-but-fetchable.
    const projects = await Project.find({ status: "active" }).sort({
      featured: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects: projects.map(sanitizeProject),
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/projects/:id (public)
export async function getPublicProject(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(404);
      throw new Error("Project not found");
    }

    const project = await Project.findOne({ _id: id, status: "active" });

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    res.status(200).json({ success: true, project: sanitizeProject(project) });
  } catch (error) {
    next(error);
  }
}
