# Admin management

An admin lists every record, searches it, opens a record for editing, and deletes records after a confirmation.

- ID: admin-management
- Priority: high
- Status: blocked
- Surfaces and roles: web / admin
- Source evidence: `apps/web/src/app/admin/page.tsx`, `AdminDashboardClient.tsx`, `apps/web/src/app/admin/edit/[id]/page.tsx`, `EditExperienceClient.tsx`, `apps/web/src/middleware.ts`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Navbar "Admin" (admin only).
- Direct URL to `/admin` or `/admin/edit/<id>`.

## Checks

- `admin-dashboard` in `verify/flows/admin-dashboard.json` — the manager lists records, search narrows them, and delete asks for confirmation before removing anything. **Blocked**: requires an admin session.

## Behavior variants

- Signed-in non-admin requesting `/admin`, which redirects to `/`.
- Delete confirmed versus cancelled.
- Editing a record and saving, then confirming the change in the public API.
- Search with no matches.

## Gaps and assumptions

- No admin identity. The admin redirect for non-admins is source-derived only.
- Delete uses `window.confirm`; a cancelled confirmation must leave the record intact. Not exercised.
- `/admin/edit/[id]` is matched by `/admin/:path*`, so it inherits the same gate.
