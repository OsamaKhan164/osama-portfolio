import React, { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";
import { formatActionLabel, formatRelativeTime, projectLabelFromMetadata } from "../utils/formatActivity.js";

// Short human description per action, built from the SAME activity data
// already recorded by the existing tracker — no new fields, no guessing.
function describeNotification(notification) {
  const who = notification.user?.name || "Someone";
  const project = projectLabelFromMetadata(notification.metadata);

  switch (notification.action) {
    case "REGISTER":
      return `${who} created an account`;
    case "LOGIN":
      return `${who} logged in`;
    case "CONTACT_SUBMIT":
      return `${who} submitted the contact form`;
    case "PROJECT_VIEW":
      return project !== "—" ? `${who} viewed ${project}` : `${who} viewed a project`;
    case "GITHUB_CLICK":
      return project !== "—" ? `${who} opened GitHub for ${project}` : `${who} opened a GitHub link`;
    case "LIVE_DEMO_CLICK":
      return project !== "—" ? `${who} opened the live demo of ${project}` : `${who} opened a live demo`;
    case "RESUME_ACCESS":
      return `${who} viewed the resume`;
    default:
      return `${who} — ${formatActionLabel(notification.action)}`;
  }
}

export default function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const load = async () => {
    try {
      const data = await api.getAdminNotifications(token, { limit: 30 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Fail quietly — the bell simply shows no badge rather than an error
      // banner, since this is a secondary/ambient feature, not a full page.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Close the dropdown on an outside click — standard anchored-menu behavior.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleMarkOneRead = async (id) => {
    // Optimistic UI update — the existing Activity record is never touched,
    // only the read-receipt ledger.
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(prev - 1, 0));
    try {
      const data = await api.markNotificationRead(id, token);
      setUnreadCount(data.unreadCount);
    } catch {
      load(); // reconcile with the server if the optimistic update drifted
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.markAllNotificationsRead(token);
    } catch {
      load();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted transition-colors duration-300 hover:border-gold/40 hover:text-gold"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold leading-none text-ink">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 max-w-[90vw] rounded-lg border border-border bg-card shadow-2xl animate-fade-in sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-display text-sm font-semibold text-heading">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-gold transition-colors hover:text-gold-bright"
              >
                <CheckCheck size={13} /> Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-muted">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">No activity yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.read && handleMarkOneRead(n.id)}
                  className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-bg-secondary/40 ${
                    n.read ? "opacity-60" : ""
                  }`}
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      n.read ? "bg-transparent" : "bg-gold"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-xs font-semibold uppercase tracking-wide ${
                        n.read ? "text-muted" : "text-gold"
                      }`}
                    >
                      {formatActionLabel(n.action)}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-sm ${
                        n.read ? "text-muted" : "text-heading"
                      }`}
                    >
                      {describeNotification(n)}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </span>
                  {n.read && <Check size={14} className="mt-1 shrink-0 text-muted" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
