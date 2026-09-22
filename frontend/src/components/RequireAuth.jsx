import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Wraps a route element. If the visitor isn't authenticated, redirects to
 * /signin and remembers the page they were trying to reach (via router
 * state) so SignIn can send them right back after a successful login.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Auth status is still being resolved (e.g. verifying a stored token
    // on refresh) — avoid a flash-redirect to /signin before we know.
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/signin" state={{ from: location.pathname }} replace />
    );
  }

  return children;
}
