# Upload page

A signed-in user opens `/upload` and learns that automated PDF extraction is still in development, with links to manual entry and the directory.

- ID: upload-page
- Priority: normal
- Status: blocked
- Surfaces and roles: web / signed-in user
- Source evidence: `apps/web/src/app/upload/page.tsx`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Navbar "Upload PDF" (signed-in only).
- Mobile menu "Upload PDF".
- Direct URL to `/upload`.

## Checks

- `upload-page-content` in `verify/flows/upload-page-content.json` — the page states the feature is in development and both actions lead somewhere useful. **Blocked**: the route requires a session.

## Behavior variants

- Guest attempt, which redirects to sign-in.
- Manual-entry link, which opens the gated contribute form.
- Directory link, which is public.

## Gaps and assumptions

- The page is a placeholder. There is no upload control, so there is no file input to exercise. The real parsing path lives in `apps/api` and `POST /api/extract`.
- Because the page is gated, a guest never sees the "coming soon" copy. That is worth a product question, not a verification failure.
