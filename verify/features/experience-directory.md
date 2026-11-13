# Experience directory

A public visitor browses every archived record as a card list and narrows it with free-text search, company, role, outcome, and sort controls. A query with no matches shows a no-results state with a way back.

- ID: experience-directory
- Priority: critical
- Status: verified
- Surfaces and roles: web / public visitor
- Source evidence: `apps/web/src/app/experiences/page.tsx`, `ExperienceDirectoryClient.tsx`, `apps/web/src/components/ExperienceCard.tsx`, `apps/web/src/lib/data.ts`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Navbar "Experiences" link.
- Home hero CTA and the feature row.
- Deep link with `?company=<name>`.
- Footer "Experiences" link.

## Checks

- `directory-browse` in `verify/flows/directory-browse.json` — all seeded records render with company, role, outcome, and round count, and the count line matches.
- `directory-search` in `verify/flows/directory-search.json` — search and the outcome filter narrow the list and update the visible count.
- `directory-empty` in `verify/flows/directory-empty.json` — an unmatched query shows the documented empty state and Reset restores the full list.
- `directory-deep-link` in `verify/flows/directory-deep-link.json` — `?company=` preselects the company filter and shows only that company.

## Behavior variants

- Search matched against company, role, department, candidate name, and raw text.
- Company filter compared case-insensitively against name and normalized name.
- Outcome segments: All, Selected, Rejected.
- Sort orders: most recent, most rounds, company A–Z.
- Combined search plus company plus outcome.
- A company with zero records versus a filter with zero matches.
- Long company names and the mobile 390 × 844 layout.

## Gaps and assumptions

- Filtering is client-side over the full record list. A 126-record seed is fine; the page has no pagination, so a much larger archive would ship every record to the browser. Not measured in this run.
- "Most recent" sorts by the numeric suffix of the record id, not by a date field.
- Opening a card is gated even though the directory itself is public. Recorded under `experience-detail`.
