# Analytics dashboard

A signed-in user reviews aggregate placement patterns: company activity, round types, outcomes, question topics, difficulty, employment type, and seasonality.

- ID: analytics-dashboard
- Priority: high
- Status: blocked
- Surfaces and roles: web / signed-in user
- Source evidence: `apps/web/src/app/analytics/page.tsx`, `apps/web/src/components/AnalyticsDashboard.tsx`, `apps/web/src/lib/data.ts` (`getAnalyticsData`)
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Navbar "Analytics" link.
- Home "Placement patterns" feature row.
- Direct URL to `/analytics`.

## Checks

- `analytics-render` in `verify/flows/analytics-render.json` — totals and each breakdown section render with values consistent with the archive. **Blocked**: the route requires a session.

## Behavior variants

- Empty archive: totals render as zero and each breakdown shows an empty state.
- A single company, or a single round type.
- Month values outside the twelve expected labels.
- Mobile reflow of the chart grid.

## Gaps and assumptions

- Blocked by the same auth gate as the question bank.
- `getDashboardMetrics` hardcodes fallback totals that do not come from data. The analytics page uses `getAnalyticsData`, which does not. Confusing the two would produce a wrong expectation, so checks must use the analytics page, not the helper.
- No chart library audit; charts are rendered as CSS or SVG and were not inspected live.
