# Doctor check

Observed on 2026-11-09 against commit `987a5e4`.

- App readiness: `GET http://127.0.0.1:3000/` → 200 with hero heading; `GET /api/experiences?limit=1` → `total: 126`, `totalPages: 126`; `GET http://127.0.0.1:8011/health` → 200 `{"status":"ok"}`
- Build identity matches current checkout: `npm run build` from `apps/web` completed for `987a5e4` with the local environment; `next start` served that build (route table included `/experiences/[id]` as dynamic and `/experiences` as static)
- Database target is isolated and approved: `mongo:7.0` container `0xtrace-verify-mongo`, published only on `127.0.0.1:27018`, no volume, seeded with 126 records. Isolation confirmed by requesting a record by its local ObjectId through `/api/experiences/<id>` and receiving the same ObjectId, which cannot exist in the remote cluster.
- Process/port ownership: port 3000 was owned by the `next-server` process started for this run; port 8011 by the `uvicorn` process started for this run. No process was killed by name.
- Auth/session validity: no session. Guest gate observed: `/questions`, `/analytics`, `/contribute`, `/upload`, `/my-experiences`, `/admin`, `/experiences/<id>`, and `/experiences/<id>/edit` each returned 307 to `/login?callbackUrl=<encoded path>`.
- Seed data or writable data location: local container only. The seed script drops and recreates `experiences` and `metadata`, so it must only ever run against the isolated store.
- Browser can reach and render one safe smoke route: `/` rendered the hero, featured record `exp_001` (Acko Tech), and archive counts 126 / 58 / 476 / 1,236 at 1440 × 900 and 390 × 844.

## Known limits

- `GROQ_API_KEY` was forced empty, so only the parser's error branches are verifiable. The success branch needs a key and a text-based PDF.
- No institutional Google identity, so signed-in and admin surfaces are blocked.
- `/favicon.ico` returns 404 and produces one console error on every page. Cosmetic; recorded as an observation, not a mapped failure.
- The FastAPI service loads `apps/api/.env` when present. It is absent in this checkout. Never point it at a real key for a verification run.
