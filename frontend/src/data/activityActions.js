// Mirrors backend/models/Activity.js's ACTIVITY_ACTIONS. Kept here only so
// the admin Activities filter dropdown has a fixed option list — it is not
// used for any validation (the backend is the source of truth for that).
export const ACTIVITY_ACTIONS = [
  "REGISTER",
  "LOGIN",
  "PROJECT_VIEW",
  "GITHUB_CLICK",
  "LIVE_DEMO_CLICK",
  "RESUME_ACCESS",
  "CONTACT_SUBMIT",
];
