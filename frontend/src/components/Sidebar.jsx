import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  User,
  Briefcase,
  Mail,
  Code2,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
const navItems = [
  { label: "Home", to: "/", icon: Home, end: true },
  { label: "About", to: "/about", icon: User },
  { label: "Projects", to: "/projects", icon: Briefcase },
  { label: "Contact", to: "/contact", icon: Mail },
];

export default function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const linkClasses = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 justify-center md:justify-start ${
      isActive
        ? "bg-gold/10 text-gold"
        : "text-muted hover:bg-card hover:text-heading"
    }`;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-border bg-bg-secondary md:w-56">
      <NavLink
        to="/"
        className="flex items-center justify-center gap-2.5  px-2 py-6 md:justify-start md:px-5"
      >
        <Code2 />
        <span className="hidden font-display text-base font-semibold text-heading md:inline">
          𝓸𝓈𝒶𝓶𝓪𝓴𝒽𝓪𝓷
        </span>
      </NavLink>

      <nav className="flex-1 space-y-1 px-2 py-4 md:px-3">
        {isAuthenticated && user?.role === "admin" && (
          <NavLink to="/admin" title="Dashboard" className={linkClasses}>
            {({ isActive }) => (
              <>
                <span
                  className={`absolute left-0 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-full bg-gold transition-opacity duration-200 md:block ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />

                <LayoutDashboard
                  size={19}
                  className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                />

                <span className="hidden md:inline">Dashboard</span>
              </>
            )}
          </NavLink>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={linkClasses}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute left-0 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-full bg-gold transition-opacity duration-200 md:block ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                <item.icon
                  size={19}
                  className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <span className="hidden md:inline">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
