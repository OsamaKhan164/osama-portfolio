import Project from "../models/Project.js";

// One-time migration of the projects that previously lived only in
// frontend/src/data/projects.js, so they aren't lost when switching to
// MongoDB. Upserts by title, so running this on every server start is
// safe: it never creates duplicates and never overwrites an existing
// document (including one an admin has since edited).
const SEED_PROJECTS = [
  {
    title: "Perfume E-commerce Store",
    description:
      "A modern e-commerce store with product browsing, search, category filtering, cart functionality and a full checkout flow.",
    technologies: ["React", "JavaScript", "Tailwind CSS", "Node.js", "Express.js", "MongoDB"],
    image: "",
    githubUrl: "",
    liveUrl: "",
    featured: true,
    status: "active",
  },
  {
    title: "Contact CRUD Application",
    description:
      "A CRUD application for managing contacts, with create, read, update and delete functionality built on a clean REST architecture.",
    technologies: ["Node.js", "Express.js", "MongoDB", "EJS"],
    image: "",
    githubUrl: "",
    liveUrl: "",
    featured: false,
    status: "active",
  },
  {
    title: "Medicine Management System",
    description:
      "A wholesale-focused system for managing products, customers, orders and inventory for a medicine e-commerce business.",
    technologies: ["React", "Node.js", "Express.js", "MongoDB"],
    image: "",
    githubUrl: "",
    liveUrl: "",
    featured: false,
    status: "active",
  },
];

export default async function seedProjects() {
  try {
    for (const project of SEED_PROJECTS) {
      // $setOnInsert + upsert: only ever creates a document if one with this
      // title doesn't already exist. Never updates/overwrites an existing one.
      await Project.findOneAndUpdate(
        { title: project.title },
        { $setOnInsert: project },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  } catch (error) {
    // Seeding is a startup convenience, not a user-facing operation — a
    // failure here should never crash the server.
    console.error("Project seed failed:", error.message);
  }
}
