import React, { useEffect, useState } from "react";
import { AlertCircle, X, Trash2, Reply } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { formatDateTime } from "../utils/formatActivity.js";

const STATUS_OPTIONS = ["new", "read", "replied"];

function replyMailto(contact) {
  const subject = encodeURIComponent(`Re: ${contact.subject}`);
  return `mailto:${contact.email}?subject=${subject}`;
}

export default function AdminMessages() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success'|'error', message }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const data = await api.getAdminContacts(token);
        if (cancelled) return;
        setContacts(data.contacts || []);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error.message || "Could not load messages.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleStatusChange = async (id, nextStatus) => {
    setUpdatingId(id);
    try {
      const data = await api.updateContactStatus(id, nextStatus, token);
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: data.contact.status } : c))
      );
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status: data.contact.status } : prev));
    } catch (error) {
      setErrorMessage(error.message || "Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteContact(deleteTarget.id, token);
      setContacts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setSelected((prev) => (prev && prev.id === deleteTarget.id ? null : prev));
      setBanner({ type: "success", message: "Message deleted." });
      setDeleteTarget(null);
    } catch (error) {
      setBanner({ type: "error", message: error.message || "Could not delete message." });
    } finally {
      setDeleting(false);
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-muted">Loading messages...</p>;
  }

  if (status === "error" && contacts.length === 0) {
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

      {errorMessage && status === "ready" && (
        <div className="flex items-center gap-2 rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {contacts.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No messages yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/60 text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3.5 font-medium">Name</th>
                  <th className="px-5 py-3.5 font-medium">Email</th>
                  <th className="px-5 py-3.5 font-medium">Subject</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-bg-secondary/40"
                  >
                    <td className="px-5 py-3.5 text-heading">{contact.name}</td>
                    <td className="px-5 py-3.5 text-muted">{contact.email}</td>
                    <td className="px-5 py-3.5 text-muted">{contact.subject}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={contact.status} />
                    </td>
                    <td className="px-5 py-3.5 text-muted">{formatDateTime(contact.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setSelected(contact)}
                          className="text-sm font-medium text-gold hover:text-gold-bright"
                        >
                          View
                        </button>
                        <a
                          href={replyMailto(contact)}
                          aria-label={`Reply to ${contact.name}`}
                          title="Reply by email"
                          className="text-muted transition-colors hover:text-accent-blue"
                        >
                          <Reply size={16} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(contact)}
                          aria-label={`Delete message from ${contact.name}`}
                          title="Delete"
                          className="text-muted transition-colors hover:text-error"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-heading">
                  {selected.subject}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {selected.name} &lt;{selected.email}&gt;
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="text-muted hover:text-heading"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-heading">
              {selected.message}
            </p>

            <p className="mt-4 text-xs text-muted">
              Received {formatDateTime(selected.createdAt)}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="text-sm text-muted">Status:</span>
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={updatingId === selected.id}
                  onClick={() => handleStatusChange(selected.id, option)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected.status === option
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border text-muted hover:border-gold hover:text-gold"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <a
                href={replyMailto(selected)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-heading transition-colors hover:border-accent-blue hover:text-accent-blue"
              >
                <Reply size={15} /> Reply by email
              </a>
              <button
                type="button"
                onClick={() => setDeleteTarget(selected)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-error hover:text-error"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this message?"
        message={
          deleteTarget
            ? `The message from "${deleteTarget.name}" will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
