# Osama Khan Portfolio — Backend

Phase 1: server + MongoDB connection scaffold only. No business logic yet.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — point at a local MongoDB instance or a MongoDB Atlas connection string.
- `CLIENT_URL` — your frontend's dev URL (defaults to Vite's `http://localhost:5173`).

## Run

```bash
npm run dev
```

You should see:
```
MongoDB connected: <host>/<db-name>
Server running in development mode on port 5000
```

## Test Phase 1

With the server running, visit or curl:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "database": "connected",
  "timestamp": "..."
}
```

If `database` shows `"disconnected"`, check your `MONGO_URI` and that MongoDB is actually running/reachable.

## What's in Phase 1

- `server.js` — Express app entry point: loads env vars, connects to MongoDB, applies CORS + JSON parsing, mounts routes, wires the error handler.
- `config/db.js` — Mongoose connection with clear failure logging (exits the process rather than running half-connected).
- `middleware/errorHandler.js` — `notFound` (404 catch-all) and `errorHandler` (consistent JSON error shape) — every future controller reuses these via `next(error)`.
- `routes/health.routes.js` — `GET /api/health` to confirm server + DB status.

Nothing in your existing frontend was touched. This backend runs as a separate process alongside it.

## Next: Phase 2

Contact form: `ContactMessage` model, `POST /api/contact` route with validation, Nodemailer setup for the notification + confirmation emails. Will only proceed once you confirm Phase 1 is running cleanly for you.

## Security hardening (Step 7)

Applied on top of everything above — see `SECURITY.md` for the full audit and rationale. Summary of what's active:

- **`JWT_SECRET` is required.** The server calls `process.exit(1)` at startup if it's missing — check your `.env` if the process won't start.
- **Helmet** is applied globally (`server.js`) for standard security headers. `contentSecurityPolicy` is intentionally disabled — this backend only ever returns JSON, never HTML, so a CSP header here has no effect on anything and could only cause confusion.
- **Request body size** is capped at `100kb` for both JSON and URL-encoded bodies (`express.json({ limit: "100kb" })`) — this matches Express's previous implicit default, just made explicit.
- **Rate limiting** (`middleware/rateLimiter.js`) is applied only to:
  - `POST /api/auth/register` and `POST /api/auth/login` — 20 requests / 15 minutes / IP
  - `POST /api/contacts` — 10 requests / hour / IP
  
  No other routes are rate limited. If you hit these limits while developing/testing, wait for the window to reset or restart the server (limits are in-memory and reset on restart).
- **`CLIENT_URL`** must be set correctly in production — if it's wrong or missing, CORS will block your real frontend (fails closed, not open).
