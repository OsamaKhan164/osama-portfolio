import React from "react";
import { Menu, LogOut, User } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminHeader({ title, onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-border bg-bg-secondary/95 px-4 py-5 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="text-muted transition-colors hover:text-heading lg:hidden"
        >
          <Menu size={22} />
        </button>
        <h1 className="font-display text-xl font-semibold tracking-tight text-heading sm:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationBell />
        <ThemeToggle display="hidden sm:flex" />

        <div className="hidden items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4 sm:flex">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gold/25 to-accent-purple/15 text-gold">
            <User size={14} />
          </span>
          <div className="text-left leading-tight">
            <p className="text-sm font-medium text-heading">{user?.name}</p>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted transition-colors duration-300 hover:border-gold/40 hover:text-gold sm:hidden"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
