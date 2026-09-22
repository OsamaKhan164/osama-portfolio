import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { api } from "../services/api.js";
import ProjectCard from "../components/ProjectCard.jsx";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const data = await api.getProjects();
        if (cancelled) return;
        setProjects(data.projects || []);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error.message || "Could not load projects right now.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:px-10 md:pt-16 md:pb-28">
      <div className="animate-fade-up">
        <p className="mb-3 font-mono text-sm tracking-wide text-gold">Projects</p>
        <h1 className="font-display text-3xl font-semibold text-heading sm:text-4xl">
          Things I've built
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          A selection of projects covering e-commerce, CRUD applications and
          inventory management. Live links and repositories will go live as
          each project is finalized.
        </p>
      </div>

      {status === "loading" && (
        <p className="mt-12 text-sm text-muted">Loading projects...</p>
      )}

      {status === "error" && (
        <div className="mt-12 flex items-center gap-2 rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {status === "ready" && projects.length === 0 && (
        <p className="mt-12 text-sm text-muted">
          No projects published yet — check back soon.
        </p>
      )}

      {status === "ready" && projects.length > 0 && (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
