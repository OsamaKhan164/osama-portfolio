import React from "react";
import { NavLink, Link } from "react-router-dom";
import { LogOut, User, ShieldCheck } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Fixed top navbar. Page navigation now lives permanently in <Sidebar />,
 * so this only carries the brand wordmark (left) and auth controls +
 * theme toggle (right) — exactly the existing auth logic, unchanged.
 */
export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-30 ml-16 border-b border-border bg-bg-secondary/80 backdrop-blur-md md:ml-56">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <NavLink to="/" className="font-display text-lg font-semibold text-heading sm:text-lg">
          Osama Khan
        </NavLink>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle display="flex" />

          {!loading && (
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="hidden items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-gold sm:flex"
                      title="Admin Panel"
                    >
                      <ShieldCheck size={14} />
                      Admin
                    </Link>
                  )}
                  <span className="hidden items-center gap-1.5 text-sm text-muted sm:flex">
                    <User size={14} className="text-gold" />
                    {user?.name?.split(" ")[0]}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    aria-label="Log out"
                    title="Log out"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted transition-colors duration-300 hover:text-gold"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="text-sm font-medium text-muted transition-colors hover:text-heading"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-md bg-gold px-3.5 py-2 text-sm font-semibold text-ink transition-all duration-300 hover:bg-gold-bright sm:px-4"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
