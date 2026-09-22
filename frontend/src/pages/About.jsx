import React from "react";
import { Eye } from "lucide-react";
import { skillGroups } from "../data/skills.js";
import SkillCard from "../components/SkillCard.jsx";
import { resumeFile } from "../data/links.js";
import useProtectedAction from "../hooks/useProtectedAction.js";

export default function About() {
  const runProtected = useProtectedAction();
  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:px-10 md:pt-16 md:pb-28">
      <div className="animate-fade-up">
        <p className="mb-3 font-mono text-sm tracking-wide text-gold">About</p>
        <h1 className="font-display text-3xl font-semibold text-heading sm:text-4xl">
          About Me
        </h1>

        <div className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <p className="text-base leading-relaxed text-muted">
              I'm Osama Khan, a BS Computer Science student and full stack
              developer who enjoys turning ideas into working products — from
              the interface someone clicks through down to the database that
              keeps everything running. I care about code that's easy to read
              six months later, not just code that works today.
            </p>
            <p className="text-base leading-relaxed text-muted">
              I mainly work across the MERN stack, building responsive
              interfaces with React and Tailwind CSS, and backing them with
              Node.js and Express APIs connected to MongoDB. I'm currently
              looking for a Frontend or MERN Stack internship where I can
              contribute, keep learning, and grow as a developer.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-6">
            <button
              type="button"
              onClick={() => runProtected(resumeFile.path, { action: "RESUME_ACCESS" })}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-button-surface border border-button-border px-6 py-3 text-sm font-semibold text-gold-light transition-all duration-300 hover:bg-button-hover active:scale-[0.98]"
            >
              <Eye size={16} /> View Resume
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-heading">
            How I approach development
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            I prefer building in small, working stages over rewriting things
            from scratch. I'd rather ship something clean and functional and
            improve it in steps than over-engineer a feature before it's
            proven useful. Maintainability and clarity matter more to me than
            clever code.
          </p>
        </div>
      </div>

      <div className="mt-20 animate-fade-up [animation-delay:150ms]">
        <p className="mb-3 font-mono text-sm tracking-wide text-gold">Skills</p>
        <h2 className="font-display text-2xl font-semibold text-heading sm:text-3xl">
          Technologies I work with
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {skillGroups.map((group) => (
            <SkillCard key={group.category} category={group.category} skills={group.skills} />
          ))}
        </div>
      </div>
    </section>
  );
}
