# Security

Summary of the Step 7 security audit and hardening pass. This documents what's in place and why — it doesn't change at runtime.

## What was fixed in this pass

| Fix | Where | Notes |
|---|---|---|
| `JWT_SECRET` required at startup | `server.js` | Exits with a clear message (never prints the secret) if unset. |
| Explicit string-type validation | `controllers/auth.controller.js` | `register`/`login` now guard against non-string `name`/`email`/`password` instead of relying on `.trim()` throwing. Validation messages are unchanged. |
| Helmet security headers | `server.js` | Applied globally. `contentSecurityPolicy` is off on purpose — see below. |
| Explicit body size limits | `server.js` | `express.json`/`express.urlencoded` capped at `100kb` (was previously Express's implicit default of the same value — now explicit). |
| Rate limiting | `middleware/rateLimiter.js`, applied in `routes/auth.routes.js` and `routes/contact.routes.js` | Scoped only to `POST /auth/register`, `POST /auth/login`, `POST /contacts`. No other route is limited. |
| `encodeURIComponent()` on path params | `frontend/src/services/api.js` | Defense-in-depth; the backend already validates every id independently. |

## Why `contentSecurityPolicy` is disabled

This backend is a JSON-only API — it never renders or serves HTML to a browser. A `Content-Security-Policy` header only has meaning on a response the browser renders as a document; on a `fetch()`-consumed JSON response it does nothing. The frontend is a separately hosted Vite/React app and is not affected either way. Leaving it enabled would only risk confusing future maintainers into thinking it does something here.

## Why `crossOriginResourcePolicy` is set to `cross-origin`

The frontend (a different origin/port in dev, a different domain in production) calls this API directly. CORS already governs *whether* that's allowed (`CLIENT_URL`). Helmet's default `Cross-Origin-Resource-Policy: same-origin` is a separate, stricter browser check aimed at preventing other sites from embedding your resources (e.g. `<img>`/`<script>` tags) — it's not needed here and left at its permissive setting so it can't interfere with the legitimate cross-origin API calls this app depends on.

## Rate limit values (and why)

- **Login/Register — 20 requests / 15 min / IP.** Generous enough that normal manual testing (typo'd passwords, re-registering during development, etc.) won't hit it, while still meaningfully slowing down brute-force or automated signup abuse.
- **Contact — 10 requests / hour / IP.** Contact submission already requires a logged-in account; this is a second layer against a single account (or shared IP/NAT) flooding the pipeline.
- Limits are stored in memory and reset if the server restarts. That's fine for a single-instance deployment; if this is ever run across multiple server instances behind a load balancer, the limits would need a shared store (e.g. Redis) to stay accurate — not implemented here, since it's not needed at the current scale.

## What was deliberately NOT changed in this pass

Per the approved scope, none of the following were touched, even though some were noted in the audit as lower-priority or informational:

- JWT expiration (`JWT_EXPIRES_IN=7d`) and the overall stateless-JWT/no-revocation model — unchanged.
- MongoDB schemas — unchanged.
- Admin authorization logic — unchanged (already correctly enforced via `protect` + `authorize("admin")` before this pass).
- Pagination for `GET /api/admin/users` and `GET /api/admin/contacts` — not added (fine at current scale).
- No dependency was upgraded to a new major version; `helmet` and `express-rate-limit` are the only new packages, both new additions rather than upgrades.

## Still your responsibility

- Run `npm install` in both `backend/` and `frontend/`, then run `npm audit` yourself — this environment has no network access, so dependency vulnerability scanning could not be run live here.
- Confirm `CLIENT_URL` and `JWT_SECRET` are set correctly wherever you deploy — the app will refuse to start (`JWT_SECRET`) or block your frontend (`CLIENT_URL`) if either is wrong, by design.
- Rotate `JWT_SECRET` and your MongoDB credentials if they were ever shared in an insecure channel (e.g. pasted in plain text somewhere).
