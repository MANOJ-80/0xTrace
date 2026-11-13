# Question bank

A signed-in user searches interview questions and coding problems, switches between the two lists, and filters by company and difficulty.

- ID: question-bank
- Priority: critical
- Status: blocked
- Surfaces and roles: web / signed-in user
- Source evidence: `apps/web/src/app/questions/page.tsx`, `QuestionBankClient.tsx`, `apps/web/src/lib/data.ts`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Navbar "Questions" link.
- Footer "Questions" link.
- A direct URL to `/questions`.

## Checks

- `question-bank-search` in `verify/flows/question-bank-search.json` — searching and filtering narrows both lists and the result count matches. **Blocked**: the route requires a session.

## Behavior variants

- Question list versus coding-problem list.
- Search matched against question text, topic, category, and company.
- Difficulty filters: all, easy, medium, hard.
- Combined search plus company plus difficulty.
- No results in either list.

## Gaps and assumptions

- The page is inside the auth matcher, so a guest never sees it. The guest branch is covered by `authentication-gate`.
- Data comes from the same records as the directory; a record with no questions contributes nothing.
- The source has no pagination, so every question is rendered at once. Not measured.
