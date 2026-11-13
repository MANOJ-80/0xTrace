# My experiences

A signed-in user sees the records they contributed and can open, edit, or delete them.

- ID: my-experiences
- Priority: high
- Status: blocked
- Surfaces and roles: web / signed-in user
- Source evidence: `apps/web/src/app/my-experiences/page.tsx`, `MyExperiencesClient.tsx`, `apps/web/src/app/api/experiences/user/route.ts`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Navbar "My Experiences" (signed-in only).
- Redirect after deleting a record from its detail page.
- Direct URL to `/my-experiences`.

## Checks

- `my-experiences-list` in `verify/flows/my-experiences-list.json` — the page lists only the session user's records and offers an empty state when there are none. **Blocked**: requires a session.

## Behavior variants

- User with zero contributed records.
- User with several records, ordered by creation time then id.
- Record deleted from the detail page and the list updating afterwards.
- A guest opening the route, which redirects to sign-in with `callbackUrl`.

## Gaps and assumptions

- Owner scoping depends on `author.email` set at ingest time. Records seeded from the canonical dataset have no author, so a fresh test account starts with an empty list. That is expected, not a bug.
- No identity, so the owner-scoping claim is source-derived only.
