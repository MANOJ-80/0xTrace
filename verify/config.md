# 0xTrace verification config

- Approved target environment: local loopback only (`127.0.0.1`). No deployed host, no remote database, no real OAuth.
- Runtime: Node.js 20.20.2, npm 10.8.2, Python 3.12.3 (project venv at `apps/api/.venv`)
- Package manager and lockfile: npm with `package-lock.json` at the repo root and in `apps/web`
- Locked dependency install command: `npm ci` from `apps/web` (existing `node_modules` was already present and was reused)
- Build command: `npm run build` from `apps/web`
- Launch command: `npm run start` from `apps/web` (`next start -p 3000`)
- PDF API launch command: `apps/api/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8011` from `apps/api`
- Readiness: `GET http://127.0.0.1:3000/` returns 200 and renders the archive hero; `GET /api/experiences?limit=1` returns `total` matching the seeded count; `GET http://127.0.0.1:8011/health` returns `{"status":"ok"}`
- Teardown: stop the `next start` and `uvicorn` processes started for the run, then `docker rm -f 0xtrace-verify-mongo`
- Browser driver: `puppeteer-core` from `apps/web/node_modules` with `/usr/bin/google-chrome` (headless). Supports exact viewports, fresh contexts, screenshots, console capture, and response inspection.
- Viewports: desktop 1440 × 900, mobile 390 × 844
- Roles in scope: public visitor; signed-in and admin roles are out of scope (no approved identity)

## Environment variables

Names only. Values are never recorded.

| Name | Required by | Run value source |
|---|---|---|
| `MONGODB_URI` | web app, seed script | Overridden per process to the local container |
| `NEXTAUTH_URL` | NextAuth | `http://127.0.0.1:3000` |
| `NEXTAUTH_SECRET` | NextAuth | Local throwaway value generated for the run |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | NextAuth Google provider | Local placeholder values; cannot complete OAuth |
| `ADMIN_EMAILS` | admin flag | Local placeholder address |
| `GROQ_API_KEY` | PDF success path | Explicitly empty to force the documented 503 branch |
| `GROQ_MODEL`, `MAX_PDF_BYTES` | PDF parser | Defaults |

The repo `.env` points at a remote MongoDB cluster. It is not edited. The local override is supplied in the process environment for the build, the server, and the seed script.

Framework precedence was confirmed by observation, not assumption: the running app returned the exact `_id` of a record created in the local container, so the process environment override wins over `.env` for this framework.

## Data isolation

- Store: `mongo:7.0` container named `0xtrace-verify-mongo`, published only on `127.0.0.1:27018`, no volume, removed at teardown
- Seed: `MONGODB_URI=mongodb://127.0.0.1:27018 node scripts/seed-mongodb.mjs` loads `data/canonical/interview_experiences_v1.3.json` (126 records) and rebuilds the `experiences` and `metadata` collections
- Reset: remove the container and re-run the seed
- Write paths exercised: none by this run. The only writes are the seed itself.
- The seed script prints "MongoDB Atlas" regardless of target. The target was confirmed separately by matching a local ObjectId through the app.

## Evidence and retention

- Results directory: `verify/results/<run-id>/` (ignored by `.gitignore`)
- Auth state directory: `verify/.auth/` (ignored; unused because no session was created)
- Keep per-check screenshots, DOM or accessibility observations, and short notes. No cookies, tokens, raw HARs, `.env` values, or candidate personal data beyond what the app itself renders on a public page.
- The canonical dataset contains real candidate accounts. Screenshots of public pages are acceptable; do not export raw record text into evidence.

## Excluded actions

- Production or deployed hosts, remote databases, real Google sign-in, real Groq calls, PDF uploads of candidate files, and any write to the archive.
