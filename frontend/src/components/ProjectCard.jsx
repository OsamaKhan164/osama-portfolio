import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Github } from "lucide-react";
import useProtectedAction from "../hooks/useProtectedAction.js";

export default function ProjectCard({ project }) {
  const { id, title, description, technologies, liveUrl, githubUrl } = project;
  const runProtected = useProtectedAction();

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_4px_24px_rgb(var(--color-gold)/0.06)]">
      {/* Thumbnail placeholder — abstract code-pattern, no fake image URL.
          Links to the project's detail page; that route itself requires
          sign-in (via RequireAuth), so this stays a plain public Link. */}
      <Link to={`/projects/${id}`} className="relative block h-44 overflow-hidden border-b border-border bg-bg-secondary">
        <div className="absolute inset-0 flex flex-col justify-center gap-2 px-6 opacity-70">
          <div className="h-2 w-2/3 rounded bg-border" />
          <div className="h-2 w-1/2 rounded bg-border" />
          <div className="h-2 w-3/5 rounded bg-gold/30" />
          <div className="h-2 w-1/3 rounded bg-border" />
        </div>
        <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-gold/50" />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <Link to={`/projects/${id}`}>
          <h3 className="font-display text-lg font-semibold text-heading transition-colors group-hover:text-gold">
            {title}
          </h3>
        </Link>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-border bg-input px-2.5 py-1 font-mono text-xs text-gold"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* GitHub / Live Demo are action-protected: clicking triggers a
            sign-in redirect if the visitor isn't authenticated yet, and
            opens the project's real URL in a new tab once they are. */}
        <div className="mt-6 flex items-center gap-5 border-t border-border pt-5">
          {liveUrl ? (
            <button
              type="button"
              onClick={() =>
                runProtected(liveUrl, {
                  action: "LIVE_DEMO_CLICK",
                  projectId: id,
                  metadata: { projectId: id, projectTitle: title },
                })
              }
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-colors hover:text-gold-bright"
            >
              <ExternalLink size={15} /> Live Demo
            </button>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-1.5 text-sm font-medium text-muted">
              <ExternalLink size={15} /> Live Demo soon
            </span>
          )}

          {githubUrl ? (
            <button
              type="button"
              onClick={() =>
                runProtected(githubUrl, {
                  action: "GITHUB_CLICK",
                  projectId: id,
                  metadata: { projectId: id, projectTitle: title },
                })
              }
              className="inline-flex items-center gap-1.5 text-sm font-medium text-heading transition-colors hover:text-gold"
            >
              <Github size={15} /> GitHub
            </button>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-1.5 text-sm font-medium text-muted">
              <Github size={15} /> Source soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
