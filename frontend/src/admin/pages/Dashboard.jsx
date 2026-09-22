import React, { useEffect, useState } from "react";
import { Users, MessageSquare, Activity, FolderKanban, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";
import StatCard from "../components/StatCard.jsx";
import { formatActionLabel, formatDateTime, projectLabelFromMetadata } from "../utils/formatActivity.js";

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const data = await api.getAdminStats(token);
        if (cancelled) return;
        setStats(data.stats);
        setRecentActivities(data.recentActivities || []);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error.message || "Could not load dashboard stats.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "loading") {
    return <p className="text-sm text-muted">Loading dashboard...</p>;
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} accent="gold" />
        <StatCard
          label="Total Messages"
          value={stats.totalContacts}
          icon={MessageSquare}
          accent="purple"
        />
        <StatCard
          label="Total Activities"
          value={stats.totalActivities}
          icon={Activity}
          accent="blue"
        />
        <StatCard
          label="Total Projects"
          value={stats.totalProjects}
          icon={FolderKanban}
          accent="gold"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-gradient-to-r from-card to-bg-secondary/40 px-5 py-4">
          <h2 className="font-display text-base font-semibold text-heading">Recent Activity</h2>
        </div>

        {recentActivities.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No activity recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/60 text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3.5 font-medium">User</th>
                  <th className="px-5 py-3.5 font-medium">Action</th>
                  <th className="px-5 py-3.5 font-medium">Project</th>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
