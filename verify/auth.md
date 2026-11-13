# 0xTrace authentication notes

## Detected setup

- Provider: Google OAuth via NextAuth (`next-auth` v4, JWT sessions)
- Domain rule: `signIn` returns `/unauthorized` unless the email ends with `@psgitech.ac.in` (`apps/web/src/lib/auth.ts`)
- Admin rule: `token.isAdmin` is true when the email is listed in `ADMIN_EMAILS`
- Route guard: `apps/web/src/middleware.ts` uses `withAuth`; every matcher path requires a token
- Sign-in page: `/login`; error page: `/unauthorized`
- Environment variable names: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAILS`

## Roles

| Role | Approved identity | Access | Restrictions |
|---|---|---|---|
| Public visitor | None | `/`, `/about`, `/experiences`, `/login`, `/unauthorized`, metadata routes, public read API | Cannot open a record, the question bank, analytics, or any write path |
| Signed-in user | Not provided | Record detail, question bank, analytics, contribute, upload, my-experiences, own-record edit | Institutional Google account required |
| Admin | Not provided | Everything above plus `/admin` and `/admin/edit/[id]` | Must be listed in `ADMIN_EMAILS` |

## Session strategy

- Login flow under test: none. OAuth cannot be completed without a real institutional Google account.
- Session method: no session created. `verify/.auth/` stays unused.
- Refresh and expiry: not applicable this run.
- Test IdP or seed identity: none documented in the repo.

## Blockers and handoff

- Blocker: no approved disposable `@psgitech.ac.in` account and no approved admin account. Authenticated UI checks are recorded as blocked.
- Not permitted: bypassing OAuth, forging a NextAuth JWT, editing `middleware.ts`, or inserting a session cookie to force access. A forged session would prove nothing about the real sign-in path and would violate the no-bypass rule.
- What can still be verified without an identity: the guest gate itself (redirect target and preserved `callbackUrl`), the login and unauthorized pages, the public read API, and the 401 responses from every protected route handler.
- To unblock later: supply one disposable institutional account plus one admin account, or approve a documented local test provider added to the project. Then add the signed-in checks and run them with a saved storage state.
