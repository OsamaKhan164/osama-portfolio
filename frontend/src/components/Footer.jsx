import React from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { contactLinks } from "../data/links.js";

export default function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    { icon: Github, label: "GitHub", href: contactLinks.github, external: true },
    { icon: Linkedin, label: "LinkedIn", href: contactLinks.linkedin, external: true },
    { icon: Mail, label: "Email", href: `mailto:${contactLinks.email}`, external: false },
  ];

  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="font-display text-base font-semibold text-heading">Osama Khan</p>
          <p className="text-sm text-muted">Full Stack Developer</p>
        </div>

        <div className="flex items-center gap-5">
          {socials.map(({ icon: Icon, label, href, external }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              aria-label={label}
              className="text-muted transition-colors duration-300 hover:text-gold"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        <p className="text-xs text-muted">
          &copy; {year} Osama Khan. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
