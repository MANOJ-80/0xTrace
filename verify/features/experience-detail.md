# Experience detail

A signed-in user opens a record and reads its company, role, outcome, candidate background, round-by-round questions, candidate advice, and the original writeup.

- ID: experience-detail
- Priority: critical
- Status: blocked
- Surfaces and roles: web / signed-in user
- Source evidence: `apps/web/src/app/experiences/[id]/page.tsx`, `apps/web/src/components/ExperienceDetailView.tsx`, `RoundModal.tsx`, `DocumentReader.tsx`, `apps/web/src/middleware.ts`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- A card in the directory.
- A question-bank result link.
- A direct URL using the MongoDB ObjectId or a legacy `exp_XXX` id.

## Checks

- `detail-guest-gate` in `verify/flows/detail-guest-gate.json` — a guest opening a record is redirected to sign-in with the record path preserved.
- `detail-content` in `verify/flows/detail-content.json` — header, rounds, advice, and original writeup render for a known record. **Blocked**: requires an institutional session.

## Behavior variants

- ObjectId URL versus legacy `exp_XXX` URL.
- Unknown id: the route calls `notFound()`.
- Records with no tips, no coding problems, or no contacts.
- Round modal opened, navigated, and closed.
- "Original Writeup" tab versus the rounds tab.
- Author or admin seeing Edit and Delete controls.

## Gaps and assumptions

- The whole route family is behind `withAuth`, so the guest check proves the gate, not the content.
- The public API `GET /api/experiences/[id]` does return the same record without a session. That is an API contract check, not evidence that the page renders.
- Delete uses `window.confirm` and then `alert` on failure; no custom dialog to assert.
