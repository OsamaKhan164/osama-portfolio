import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Wraps the /admin route tree. This is a UI convenience only — the real
 * security boundary is the backend's `protect` + `authorize("admin")` on
 * every /api/admin/* route. This component just prevents rendering the
 * admin UI for visitors who could never successfully call those APIs
 * anyway.
 */
export default function RequireAdmin({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (user?.role !== "admin") {
    // Logged in but not an admin — send back to the public site rather
    // than revealing an "unauthorized" admin-shaped page.
    return <Navigate to="/" replace />;
  }

  return children;
}
