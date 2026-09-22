import mongoose from "mongoose";

export const PROJECT_STATUSES = ["active", "draft"];

const URL_RE = /^https?:\/\/.+/i;

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title is too long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description is too long"],
    },
    // URL for now — file upload is a future step, not implemented here.
    image: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Image URL is too long"],
    },
    technologies: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr) ? arr.map((t) => String(t).trim()).filter(Boolean) : [],
    },
    // Optional on purpose — not every project has a repo/demo yet, and we
    // never invent one. Validated as a URL only when actually provided.
    githubUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (v) => !v || URL_RE.test(v),
        message: "GitHub URL must be a valid http(s) URL",
      },
    },
    liveUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (v) => !v || URL_RE.test(v),
        message: "Live Demo URL must be a valid http(s) URL",
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: "active",
    },
  },
  { timestamps: true }
);

projectSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Project", projectSchema);
