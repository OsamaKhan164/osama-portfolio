import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";

/**
 * For actions that aren't full route navigations — GitHub, Live Demo,
 * Resume — but still need the "sign in, then continue" flow, plus a
 * best-effort activity log of the action once it actually happens.
 *
 * Usage:
 *   const runProtected = useProtectedAction();
 *   runProtected(project.githubUrl, {
 *     action: "GITHUB_CLICK",
 *     projectId: project.id, // real MongoDB _id — stored on the Activity's `project` ref
 *     metadata: { projectId: project.id, projectTitle: project.title },
 *   });
 *
 * If signed in: opens the URL and logs the activity (fire-and-forget —
 * a logging failure never blocks or breaks the actual action).
 * If not: remembers the URL + action + projectId + metadata and sends the
 * visitor to /signin; SignIn/SignUp resume both the URL and the activity
 * log after a successful login.
 */
export default function useProtectedAction() {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return function runProtected(url, { action, projectId, metadata } = {}) {
    if (!url) return; // caller is responsible for not invoking this when there's nothing to open

    if (isAuthenticated) {
      window.open(url, "_blank", "noopener,noreferrer");

      if (action) {
        api.logActivity({ action, projectId, metadata }, token).catch(() => {
          // Activity logging must never disrupt the actual user action.
        });
      }
      return;
    }

    navigate("/signin", {
      state: {
        from: location.pathname,
        pendingAction: { type: "external", url, action, projectId, metadata },
      },
    });
  };
}
