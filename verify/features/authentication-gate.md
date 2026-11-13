# Authentication gate

A guest who requests a protected route is sent to the sign-in page with the original destination preserved. The sign-in page explains the institutional requirement, and a non-institutional account is sent to the access-denied page.

- ID: authentication-gate
- Priority: critical
- Status: verified
- Surfaces and roles: web / public visitor
- Source evidence: `apps/web/src/middleware.ts`, `apps/web/src/lib/auth.ts`, `apps/web/src/app/login/page.tsx`, `apps/web/src/app/unauthorized/page.tsx`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Any gated URL requested directly.
- A directory card clicked by a guest.
- The navbar "Log in" action.

## Checks

- `auth-guest-redirects` in `verify/flows/auth-guest-redirects.json` — each gated route redirects to `/login` with the original path in `callbackUrl`.
- `auth-login-page` in `verify/flows/auth-login-page.json` — the sign-in page renders the institutional-email message and a single Google action.
- `auth-unauthorized` in `verify/flows/auth-unauthorized.json` — the access-denied page explains the domain restriction and offers a way home.

## Behavior variants

- `callbackUrl` preserved for a deep nested path.
- Already-signed-in visitor opening `/login`.
- Non-institutional account landing on `/unauthorized`.
- Admin route requested by a signed-in non-admin, which redirects to `/`.

## Gaps and assumptions

- No identity, so no sign-in completion, session refresh, or expiry check.
- The Google button is not clicked: it would leave the local app for the provider and cannot succeed with placeholder client values.
- Crawler user agents bypass the gate for link previews. Not exercised; it is a deliberate exception in `middleware.ts`.
