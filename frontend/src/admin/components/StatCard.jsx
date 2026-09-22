import React from "react";

const ACCENTS = {
  gold: {
    icon: "text-gold",
    iconBg: "bg-gradient-to-br from-gold/25 to-gold/5",
    hoverBorder: "hover:border-gold/40",
  },
  purple: {
    icon: "text-accent-purple",
    iconBg: "bg-gradient-to-br from-accent-purple/25 to-accent-purple/5",
    hoverBorder: "hover:border-accent-purple/40",
  },
  blue: {
    icon: "text-accent-blue",
    iconBg: "bg-gradient-to-br from-accent-blue/25 to-accent-blue/5",
    hoverBorder: "hover:border-accent-blue/40",
  },
};

export default function StatCard({ label, value, icon: Icon, accent = "gold" }) {
  const theme = ACCENTS[accent] || ACCENTS.gold;

  return (
    <div
      className={`group rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${theme.hoverBorder}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && (
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 ${theme.iconBg} ${theme.icon}`}
          >
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-3xl font-semibold text-heading">{value}</p>
    </div>
  );
}
