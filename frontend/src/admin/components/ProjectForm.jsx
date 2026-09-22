import React, { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["active", "draft"];

const fieldClasses = (hasError) =>
  `w-full rounded-md border bg-input px-3.5 py-2.5 text-sm text-heading placeholder:text-muted/60 transition-colors duration-200 focus:outline-none focus:ring-1 ${
    hasError
      ? "border-error/60 focus:border-error focus:ring-error/40"
      : "border-border focus:border-gold focus:ring-gold/40"
  }`;

function emptyValues() {
  return {
    title: "",
    description: "",
    image: "",
    technologies: [],
    githubUrl: "",
    liveUrl: "",
    featured: false,
    status: "active",
  };
}

export default function ProjectForm({ initialProject, onSubmit, onCancel, saving, serverErrors }) {
  const [values, setValues] = useState(() =>
    initialProject
      ? {
          title: initialProject.title || "",
          description: initialProject.description || "",
          image: initialProject.image || "",
          technologies: initialProject.technologies || [],
          githubUrl: initialProject.githubUrl || "",
          liveUrl: initialProject.liveUrl || "",
          featured: Boolean(initialProject.featured),
          status: initialProject.status || "active",
        }
      : emptyValues()
  );
  const [techInput, setTechInput] = useState("");
  const [errors, setErrors] = useState({});

  const mergedErrors = { ...errors, ...serverErrors };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const addTechnology = () => {
    const tag = techInput.trim();
    if (!tag) return;
    if (values.technologies.includes(tag)) {
      setTechInput("");
      return;
    }
    setValues((prev) => ({ ...prev, technologies: [...prev.technologies, tag] }));
    setTechInput("");
  };

  const handleTechKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTechnology();
    }
  };

  const removeTechnology = (tag) => {
    setValues((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tag),
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = "Title is required.";
    if (!values.description.trim()) nextErrors.description = "Description is required.";
    return nextErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-heading">
          Title
        </label>
        <input
          id="title"
          name="title"
          value={values.title}
          onChange={handleChange}
          className={fieldClasses(mergedErrors.title)}
          placeholder="Project name"
        />
        {mergedErrors.title && <p className="mt-1 text-xs text-error">{mergedErrors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-heading">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={values.description}
          onChange={handleChange}
          className={`${fieldClasses(mergedErrors.description)} resize-none`}
          placeholder="What does this project do?"
        />
        {mergedErrors.description && (
          <p className="mt-1 text-xs text-error">{mergedErrors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="image" className="mb-1.5 block text-sm font-medium text-heading">
          Image URL <span className="text-muted">(optional)</span>
        </label>
        <input
          id="image"
          name="image"
          value={values.image}
          onChange={handleChange}
          className={fieldClasses(mergedErrors.image)}
          placeholder="https://..."
        />
        {mergedErrors.image && <p className="mt-1 text-xs text-error">{mergedErrors.image}</p>}
      </div>

      <div>
        <label htmlFor="tech-input" className="mb-1.5 block text-sm font-medium text-heading">
          Technologies
        </label>
        <div className="flex gap-2">
          <input
            id="tech-input"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleTechKeyDown}
            className={fieldClasses(false)}
            placeholder="Type a technology, press Enter"
          />
          <button
            type="button"
            onClick={addTechnology}
            className="flex shrink-0 items-center justify-center rounded-md border border-border px-3 text-muted transition-colors hover:border-gold hover:text-gold"
            aria-label="Add technology"
          >
            <Plus size={16} />
          </button>
        </div>
        {values.technologies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {values.technologies.map((tech) => (
              <span
                key={tech}
                className="flex items-center gap-1 rounded-md border border-border bg-input px-2 py-1 font-mono text-xs text-gold"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  aria-label={`Remove ${tech}`}
                  className="text-muted hover:text-error"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        {mergedErrors.technologies && (
          <p className="mt-1 text-xs text-error">{mergedErrors.technologies}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="githubUrl" className="mb-1.5 block text-sm font-medium text-heading">
            GitHub URL <span className="text-muted">(optional)</span>
          </label>
          <input
            id="githubUrl"
            name="githubUrl"
            value={values.githubUrl}
            onChange={handleChange}
            className={fieldClasses(mergedErrors.githubUrl)}
            placeholder="https://github.com/..."
          />
          {mergedErrors.githubUrl && (
            <p className="mt-1 text-xs text-error">{mergedErrors.githubUrl}</p>
          )}
        </div>

        <div>
          <label htmlFor="liveUrl" className="mb-1.5 block text-sm font-medium text-heading">
            Live Demo URL <span className="text-muted">(optional)</span>
          </label>
          <input
            id="liveUrl"
            name="liveUrl"
            value={values.liveUrl}
            onChange={handleChange}
            className={fieldClasses(mergedErrors.liveUrl)}
            placeholder="https://..."
          />
          {mergedErrors.liveUrl && (
            <p className="mt-1 text-xs text-error">{mergedErrors.liveUrl}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label htmlFor="status" className="flex items-center gap-2 text-sm text-heading">
          Status
          <select
            id="status"
            name="status"
            value={values.status}
            onChange={handleChange}
            className="rounded-md border border-border bg-input px-2.5 py-1.5 text-sm text-heading focus:border-gold focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "active" ? "Active" : "Draft"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-heading">
          <input
            type="checkbox"
            name="featured"
            checked={values.featured}
            onChange={handleChange}
            className="h-4 w-4 rounded border-border accent-gold"
          />
          Featured
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-ink transition-all duration-300 hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {initialProject ? "Save Changes" : "Create Project"}
        </button>
      </div>
    </form>
  );
}
