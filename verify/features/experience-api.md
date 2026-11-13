# Experience API

The Next.js route handlers expose a public read contract and a session-protected write contract for interview records.

- ID: experience-api
- Priority: normal
- Status: verified
- Surfaces and roles: api / public visitor and signed-in user
- Source evidence: `apps/web/src/app/api/experiences/route.ts`, `apps/web/src/app/api/experiences/[id]/route.ts`, `apps/web/src/app/api/experiences/user/route.ts`, `apps/web/src/app/api/canonical/ingest/route.ts`, `apps/web/src/app/api/extract/route.ts`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- `GET /api/experiences` with `search`, `company`, `role`, `outcome`, `page`, `limit`
- `GET /api/experiences/<id>` by ObjectId or legacy id
- `PUT` and `DELETE /api/experiences/<id>`
- `GET /api/experiences/user`
- `POST /api/canonical/ingest`
- `POST /api/extract`

## Checks

- `api-list-contract` in `verify/flows/api-list-contract.json` — the list endpoint returns the documented envelope, honors filters and paging, and matches the seeded count.
- `api-detail-404` in `verify/flows/api-detail-404.json` — a known record resolves by ObjectId and legacy id, and an unknown id returns 404 with a JSON error.
- `api-protected-writes` in `verify/flows/api-protected-writes.json` — every write and user-scoped endpoint rejects an anonymous caller with 401.

## Behavior variants

- `limit` above the record count, `page` past the last page, and non-numeric paging values.
- Filters that match nothing.
- A malformed ObjectId that is still a valid legacy id lookup.
- Author versus admin versus unrelated signed-in user on PUT and DELETE (403 path). Not reachable without identities.
- A request body with an invalid or missing draft on ingest.

## Gaps and assumptions

- The read API is public even though the record pages are gated. That mismatch is a product decision to confirm, not a verification failure.
- `page` and `limit` are parsed with `parseInt` and not validated. A negative or zero `limit` produces an empty page rather than an error. Recorded as a source-level observation; not asserted.
- Write success paths need identities and are blocked.
