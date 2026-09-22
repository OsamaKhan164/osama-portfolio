import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";
import { formatDateTime } from "../utils/formatActivity.js";

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const data = await api.getAdminUsers(token);
        if (cancelled) return;
        setUsers(data.users || []);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error.message || "Could not load users.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "loading") {
    return <p className="text-sm text-muted">Loading users...</p>;
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
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {users.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted">No registered users yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-secondary/60 text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Role</th>
                <th className="px-5 py-3.5 font-medium">Registered</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-bg-secondary/40"
                >
                  <td className="px-5 py-3.5 text-heading">{user.name}</td>
                  <td className="px-5 py-3.5 text-muted">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                        user.role === "admin"
                          ? "border-accent-purple/40 bg-accent-purple/10 text-accent-purple"
                          : "border-border bg-input text-muted"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{formatDateTime(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
