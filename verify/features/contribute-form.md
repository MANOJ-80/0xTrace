# Contribute form

A signed-in user submits an interview experience through a structured form: company, role, candidate details, one or more rounds with questions and coding problems, compensation, tips, and contacts.

- ID: contribute-form
- Priority: high
- Status: blocked
- Surfaces and roles: web / signed-in user
- Source evidence: `apps/web/src/app/contribute/page.tsx`, `apps/web/src/components/ManualEntryForm.tsx`, `apps/web/src/app/api/canonical/ingest/route.ts`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Navbar "Contribute" (signed-in only).
- Home and About contribution CTAs, which redirect a guest to sign-in.
- `/upload` "Write Experience Manually" action.

## Checks

- `contribute-submit` in `verify/flows/contribute-submit.json` — a valid submission creates a record that appears in the directory and in My Experiences. **Blocked**: requires a session and writes to the archive.

## Behavior variants

- Missing required company, role, round name, or round walkthrough.
- A single round versus several rounds.
- A round with questions, with coding problems, or with neither.
- Optional compensation, tips, mistakes, and contacts left blank.
- Double submission of the same form.
- Very long walkthrough text.

## Gaps and assumptions

- Blocked by the auth gate. The API-level 401 is covered by `experience-api`.
- The form posts to `/api/canonical/ingest`, which assigns the next `exp_XXX` id and records the author email from the session.
- Validation is mostly client-side; the server only requires a company name and at least one round. A browser check cannot prove server-side field validation because the client blocks submission first.
