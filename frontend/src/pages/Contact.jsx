import React from "react";
import { Mail, Github, Linkedin } from "lucide-react";
import ContactForm from "../components/ContactForm.jsx";
import { contactLinks } from "../data/links.js";

export default function Contact() {
  const details = [
    { icon: Mail, label: contactLinks.email, href: `mailto:${contactLinks.email}` },
    { icon: Linkedin, label: "LinkedIn", href: contactLinks.linkedin },
    { icon: Github, label: "GitHub", href: contactLinks.github },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:px-10 md:pt-16 md:pb-28">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
        <div className="animate-fade-up">
          <p className="mb-3 font-mono text-sm tracking-wide text-gold">Contact</p>
          <h1 className="font-display text-3xl font-semibold text-heading sm:text-4xl">
            Let's work together
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            I'm currently open to internship, freelance and full-time
            opportunities as a full stack developer. Send a message and I'll
            get back to you as soon as I can.
          </p>

          <div className="mt-8 space-y-4">
            {details.map(({ icon: Icon, label, href }) => {
              const isExternal = href.startsWith("http");
              return (
                <a
                  key={label}
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 text-sm text-muted transition-colors duration-300 hover:text-gold"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card">
                    <Icon size={16} />
                  </span>
                  {label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="animate-fade-up rounded-lg border border-border bg-card p-6 sm:p-8 [animation-delay:150ms]">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
