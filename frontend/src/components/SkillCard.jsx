import React from "react";

export default function SkillCard({ category, skills }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 transition-colors duration-300 hover:border-gold/40">
      <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-gold">
        {category}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="rounded-md border border-border bg-input px-3 py-1.5 text-sm text-heading"
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}
