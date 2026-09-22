const ACTION_LABELS = {
  REGISTER: "Account Registered",
  LOGIN: "Logged In",
  PROJECT_VIEW: "Project Viewed",
  GITHUB_CLICK: "GitHub Click",
  LIVE_DEMO_CLICK: "Live Demo Click",
  RESUME_ACCESS: "Resume Access",
  CONTACT_SUBMIT: "Contact Submitted",
};

export function formatActionLabel(action) {
  return ACTION_LABELS[action] || action;
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function projectLabelFromMetadata(metadata) {
  if (!metadata) return "—";
  return metadata.projectTitle || metadata.projectId || "—";
}

export function formatRelativeTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDateTime(value);
}
