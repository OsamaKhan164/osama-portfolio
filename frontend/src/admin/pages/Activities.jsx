import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";
import { ACTIVITY_ACTIONS } from "../../data/activityActions.js";
import { formatActionLabel, formatDateTime, projectLabelFromMetadata } from "../utils/formatActivity.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function AdminActivities() {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success'|'error', message }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const data = await api.getAdminActivities(token, { page, limit: 20 });
        if (cancelled) return;
        setActivities(data.activities || []);
        setTotalPages(data.totalPages || 1);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error.message || "Could not load activities.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteActivity(deleteTarget.id, token);
      setActivities((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setBanner({ type: "success", message: "Activity deleted." });
      setDeleteTarget(null);
    } catch (error) {
      setBanner({ type: "error", message: error.message || "Could not delete activity." });
    } finally {
      setDeleting(false);
    }
  };

  // Simple client-side filtering over the current page — kept intentionally
  // basic rather than adding server-side filter params.
  const filtered = useMemo(() => {
    return activities.filter((activity) => {
      const matchesAction = actionFilter === "all" || activity.action === actionFilter;
      const query = userFilter.trim().toLowerCase();
      const matchesUser =
        !query ||
        activity.user?.name?.toLowerCase().includes(query) ||
        activity.user?.email?.toLowerCase().includes(query);
      return matchesAction && matchesUser;
    });
  }, [activities, actionFilter, userFilter]);

  if (status === "loading") {
    return <p className="text-sm text-muted">Loading activities...</p>;
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
        <AlertCircle size={18} />
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {banner && (
        <div
          className={`flex items-center justify-between gap-2 rounded-md border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-gold/30 bg-gold/5 text-gold"
              : "border-error/30 bg-error/5 text-error"
          }`}
        >
          <span>{banner.message}</span>
          <button onClick={() => setBanner(null)} aria-label="Dismiss" className="text-current">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-md border border-border bg-input px-3 py-2 text-sm text-heading focus:border-gold focus:outline-none"
        >
          <option value="all">All actions</option>
          {ACTIVITY_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {formatActionLabel(action)}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          placeholder="Filter by user name or email"
          className="min-w-[220px] flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm text-heading placeholder:text-muted/60 focus:border-gold focus:outline-none"
        />
      </div>

      <div className="rounded-lg border border-border bg-card">
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No matching activity.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/60 text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3.5 font-medium">User</th>
                  <th className="px-5 py-3.5 font-medium">Action</th>
                  <th className="px-5 py-3.5 font-medium">Project</th>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-bg-secondary/40"
                  >
                    <td className="px-5 py-3.5 text-heading">
                      {activity.user?.name || "Unknown user"}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{formatActionLabel(activity.action)}</td>
                    <td className="px-5 py-3.5 text-muted">
                      {projectLabelFromMetadata(activity.metadata)}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{formatDateTime(activity.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(activity)}
                        aria-label="Delete activity"
                        title="Delete"
                        className="text-muted transition-colors hover:text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this activity record?"
        message="This activity log entry will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
