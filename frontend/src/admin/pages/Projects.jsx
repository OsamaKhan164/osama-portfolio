import React, { useEffect, useState } from "react";
import { Github, ExternalLink, AlertCircle, Plus, Pencil, Trash2, Star, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";
import { formatDateTime } from "../utils/formatActivity.js";
import ProjectForm from "../components/ProjectForm.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function AdminProjects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null = creating
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [banner, setBanner] = useState(null); // { type: 'success'|'error', message }

  const load = async () => {
    setStatus("loading");
    try {
      const data = await api.getAdminProjects(token);
      setProjects(data.projects || []);
      setStatus("ready");
    } catch (error) {
      setErrorMessage(error.message || "Could not load projects.");
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openCreateForm = () => {
    setEditingProject(null);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditForm = (project) => {
    setEditingProject(project);
    setFormErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingProject(null);
    setFormErrors({});
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    setFormErrors({});
    try {
      if (editingProject) {
        const data = await api.updateProject(editingProject.id, values, token);
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? data.project : p)));
        setBanner({ type: "success", message: "Project updated." });
      } else {
        const data = await api.createProject(values, token);
        setProjects((prev) => [data.project, ...prev]);
        setBanner({ type: "success", message: "Project created." });
      }
      setFormOpen(false);
      setEditingProject(null);
    } catch (error) {
      if (error.fieldErrors) {
        setFormErrors(error.fieldErrors);
      } else {
        setBanner({ type: "error", message: error.message || "Could not save project." });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteProject(deleteTarget.id, token);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setBanner({ type: "success", message: "Project deleted." });
      setDeleteTarget(null);
    } catch (error) {
      setBanner({ type: "error", message: error.message || "Could not delete project." });
    } finally {
      setDeleting(false);
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-muted">Loading projects...</p>;
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
        <AlertCircle size={18} />
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {banner && (
        <div
          className={`flex items-center justify-between gap-2 rounded-md border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-gold/30 bg-gold/5 text-gold"
              : "border-error/30 bg-error/5 text-error"
          }`}
        >
          <span>{banner.message}</span>
          <button onClick={() => setBanner(null)} aria-label="Dismiss" className="text-current">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink transition-all duration-300 hover:bg-gold-bright"
        >
          <Plus size={16} /> Add Project
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {projects.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No projects yet — add your first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/60 text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3.5 font-medium">Project</th>
                  <th className="px-5 py-3.5 font-medium">Technologies</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Links</th>
                  <th className="px-5 py-3.5 font-medium">Created</th>
                  <th className="px-5 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-border align-top transition-colors last:border-0 hover:bg-bg-secondary/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-input">
                          {project.image ? (
                            <img
                              src={project.image}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="h-1.5 w-8 rounded bg-border" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-heading">{project.title}</p>
                          {project.featured && (
                            <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-gold">
                              <Star size={11} className="fill-gold" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[220px] px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded border border-border bg-input px-2 py-0.5 font-mono text-xs text-gold"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                          project.status === "active"
                            ? "border-gold-bright/30 bg-gold-bright/10 text-gold-bright"
                            : "border-border bg-input text-muted"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {project.githubUrl ? (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted hover:text-gold"
                            title="GitHub"
                          >
                            <Github size={16} />
                          </a>
                        ) : (
                          <Github size={16} className="text-border" />
                        )}
                        {project.liveUrl ? (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted hover:text-gold"
                            title="Live Demo"
                          >
                            <ExternalLink size={16} />
                          </a>
                        ) : (
                          <ExternalLink size={16} className="text-border" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{formatDateTime(project.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditForm(project)}
                          aria-label={`Edit ${project.title}`}
                          className="text-muted hover:text-gold"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(project)}
                          aria-label={`Delete ${project.title}`}
                          className="text-muted hover:text-error"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-6 animate-fade-in">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-heading">
                {editingProject ? "Edit Project" : "Add Project"}
              </h2>
              <button onClick={closeForm} aria-label="Close" className="text-muted hover:text-heading">
                <X size={20} />
              </button>
            </div>
            <ProjectForm
              initialProject={editingProject}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              saving={saving}
              serverErrors={formErrors}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this project?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed from the public portfolio. This cannot be easily undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
