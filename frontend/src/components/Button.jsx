import React from "react";
import { Link } from "react-router-dom";

/**
 * Reusable Button.
 * - variant: "primary" | "secondary" | "ghost"
 * - as="link" renders a React Router <Link> using `to`, otherwise a <button>
 */
export default function Button({
  children,
  variant = "primary",
  to,
  href,
  type = "button",
  onClick,
  icon: Icon,
  className = "",
  disabled = false,
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gold text-ink hover:bg-gold-bright hover:shadow-[0_0_20px_rgb(var(--color-gold-bright)/0.25)] active:scale-[0.98]",
    secondary:
      "bg-button-surface border border-button-border text-gold-light hover:bg-button-hover active:scale-[0.98]",
    ghost: "text-muted hover:text-gold",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
        {Icon && <Icon size={16} />}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        {Icon && <Icon size={16} />}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}
