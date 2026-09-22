import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";

export default function ProjectDetail() {
  const { id } = useParams();
  const { token } = useAuth();

  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const data = await api.getProject(id);
        if (cancelled) return;
        setProject(data.project);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error.message || "This project could not be found.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // This route only ever renders for an authenticated visitor (it's wrapped
  // in RequireAuth), so a successful load here is itself the "authenticated
  // view" event. Guard with a ref so React StrictMode's dev-only double
  // effect invocation can't create two records for one real page view.
  const hasLoggedView = useRef(false);
  useEffect(() => {
    if (!project || hasLoggedView.current) return;
    hasLoggedView.current = true;

    api
      .logActivity(
        {
          action: "PROJECT_VIEW",
          projectId: project.id,
          metadata: { projectId: project.id, projectTitle: project.title },
        },
        token
      )
      .catch(() => {
        // Activity logging must never disrupt the actual page view.
      });
  }, [project, token]);

  if (status === "loading") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted">Loading project...</p>
      </section>
    );
  }

  if (status === "error" || !project) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-heading">
          Project not found
        </h1>
        <p className="mt-3 text-sm text-muted">{errorMessage}</p>
        <Link
          to="/projects"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-bright"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </section>
    );
  }

  const { title, description, technologies, liveUrl, githubUrl } = project;

  const handleLiveDemoClick = () => {
    api
      .logActivity(
        {
          action: "LIVE_DEMO_CLICK",
          projectId: project.id,
          metadata: { projectId: project.id, projectTitle: title },
        },
        token
      )
      .catch(() => {});
  };

  const handleGithubClick = () => {
    api
      .logActivity(
        {
          action: "GITHUB_CLICK",
          projectId: project.id,
          metadata: { projectId: project.id, projectTitle: title },
        },
        token
      )
      .catch(() => {});
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20 md:px-10 md:py-28">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-gold"
      >
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="mt-6 animate-fade-up">
        <h1 className="font-display text-3xl font-semibold text-heading sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-border bg-input px-2.5 py-1 font-mono text-xs text-gold"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
          {liveUrl ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLiveDemoClick}
              className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:bg-gold-bright"
            >
              <ExternalLink size={16} /> Live Demo
            </a>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-muted">
              <ExternalLink size={16} /> Live Demo coming soon
            </span>
          )}

          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGithubClick}
              className="inline-flex items-center gap-2 rounded-md bg-button-surface border border-button-border px-6 py-3 text-sm font-semibold text-gold-light transition-colors hover:bg-button-hover"
            >
              <Github size={16} /> View Source
            </a>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-muted">
              <Github size={16} /> Source coming soon
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
