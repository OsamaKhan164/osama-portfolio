const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Thin fetch wrapper: builds the URL, attaches JSON headers and an
 * Authorization header when a token is provided, and normalizes errors
 * into thrown Error objects with the backend's message.
 */
async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Could not reach the server. Please try again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong. Please try again.");
    if (data.errors) error.fieldErrors = data.errors;
    throw error;
  }

  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),
  submitContact: (payload, token) =>
    request("/contacts", { method: "POST", body: payload, token }),
  logActivity: (payload, token) =>
    request("/activity", { method: "POST", body: payload, token }),
  // Public projects — MongoDB-backed, no auth required to browse.
  getProjects: () => request("/projects"),
  getProject: (id) => request(`/projects/${encodeURIComponent(id)}`),
  // Admin — every call requires an admin JWT; the backend enforces this
  // independently via `protect` + `authorize("admin")`.
  getAdminStats: (token) => request("/admin/stats", { token }),
  getAdminUsers: (token) => request("/admin/users", { token }),
  getAdminContacts: (token) => request("/admin/contacts", { token }),
  updateContactStatus: (id, status, token) =>
    request(`/admin/contacts/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: { status },
      token,
    }),
  deleteContact: (id, token) =>
    request(`/admin/contacts/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  getAdminActivities: (token, { page = 1, limit = 20 } = {}) =>
    request(`/admin/activities?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`, {
      token,
    }),
  deleteActivity: (id, token) =>
    request(`/admin/activities/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  getAdminProjects: (token) => request("/admin/projects", { token }),
  createProject: (payload, token) =>
    request("/admin/projects", { method: "POST", body: payload, token }),
  updateProject: (id, payload, token) =>
    request(`/admin/projects/${encodeURIComponent(id)}`, { method: "PUT", body: payload, token }),
  deleteProject: (id, token) =>
    request(`/admin/projects/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  // Notifications — reuses the existing Activity records; this is a
  // read-state presentation layer, not a second tracking system.
  getAdminNotifications: (token, { limit = 30 } = {}) =>
    request(`/admin/notifications?limit=${encodeURIComponent(limit)}`, { token }),
  markNotificationRead: (id, token) =>
    request(`/admin/notifications/${encodeURIComponent(id)}/read`, { method: "POST", token }),
  markAllNotificationsRead: (token) =>
    request("/admin/notifications/read-all", { method: "POST", token }),
};
