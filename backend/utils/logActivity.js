import Activity, { ACTIVITY_ACTIONS } from "../models/Activity.js";

// Metadata is attacker/typo-adjacent input in the client-triggered case, so
// this is a hard denylist on top of the controller-level allowlist — belt
// and suspenders against ever persisting something sensitive.
const SENSITIVE_KEY_FRAGMENTS = ["password", "token", "jwt", "secret", "mongo", "uri", "credential"];

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return {};

  const clean = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEY_FRAGMENTS.some((fragment) => lowerKey.includes(fragment))) continue;

    if (typeof value === "string") {
      clean[key] = value.slice(0, 300); // guard against oversized payloads
    } else if (typeof value === "number" || typeof value === "boolean" || value === null) {
      clean[key] = value;
    }
    // objects/arrays/functions are silently dropped — metadata stays flat and small
  }
  return clean;
}

/**
 * Fire-and-forget activity logger.
 *
 * Deliberately never throws: a failure here must never fail the real
 * request that triggered it (register, login, contact submit, etc).
 * Callers can call this without awaiting, or await it — either way it
 * always resolves.
 */
export default async function logActivity({ userId, action, projectId, metadata }) {
  try {
    if (!userId) {
      console.warn("logActivity called without a userId — skipping.");
      return;
    }
    if (!ACTIVITY_ACTIONS.includes(action)) {
      console.warn(`logActivity called with unknown action "${action}" — skipping.`);
      return;
    }

    await Activity.create({
      user: userId,
      action,
      project: projectId || null,
      metadata: sanitizeMetadata(metadata),
    });
  } catch (error) {
    // Logging is best-effort infrastructure, not user-facing functionality.
    console.error(`Activity logging failed for action "${action}":`, error.message);
  }
}
