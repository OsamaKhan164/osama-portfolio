import React from "react";

const STYLES = {
  new: "border-gold/40 bg-gold/10 text-gold",
  read: "border-border bg-input text-muted",
  replied: "border-gold-bright/30 bg-gold-bright/10 text-gold-bright",
};

const LABELS = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
        STYLES[status] || STYLES.new
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
