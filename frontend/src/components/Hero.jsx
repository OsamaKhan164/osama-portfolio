import React from "react";
import { ArrowRight, Mail } from "lucide-react";
import Button from "./Button.jsx";
import PhotoCard from "./PhotoCard.jsx";

const floatingSkills = [
  { label: "React", top: "-4%", left: "4%", delay: "0s" },
  { label: "Node.js", top: "8%", left: "82%", delay: "0.8s" },
  { label: "MongoDB", top: "40%", left: "-6%", delay: "1.6s" },
  { label: "JavaScript", top: "62%", left: "86%", delay: "0.4s" },
  { label: "Express", top: "92%", left: "10%", delay: "1.2s" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* ambient accent glow, kept faint */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-16 md:grid-cols-2 md:px-10 md:py-24">
        {/* Left: copy, left-aligned */}
        <div className="animate-fade-up text-left">
          <p className="mb-4 font-mono text-sm tracking-wide text-gold">Hi, I&apos;m Osama Khan</p>
          <h1 className="text-balance font-display text-4xl font-semibold leading-tight text-heading sm:text-5xl">
            Full Stack Developer
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            I build modern, responsive and user-focused web applications using
            React, Node.js and the tools that turn ideas into products people
            actually enjoy using.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button to="/projects" variant="primary" icon={ArrowRight}>
              View Projects
            </Button>
            <Button to="/contact" variant="secondary" icon={Mail}>
              Let's Connect
            </Button>
          </div>
        </div>

        {/* Right: photo + floating skill badges */}
        <div className="animate-fade-in [animation-delay:200ms]">
          <div className="relative mx-auto w-full max-w-sm">
            {floatingSkills.map((skill) => (
              <span
                key={skill.label}
                className="absolute z-10 hidden select-none rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-gold shadow-sm animate-float sm:block"
                style={{ top: skill.top, left: skill.left, animationDelay: skill.delay }}
              >
                {skill.label}
              </span>
            ))}
            <PhotoCard />
          </div>
        </div>
      </div>
    </section>
  );
}
