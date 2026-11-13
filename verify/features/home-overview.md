# Home overview

A public visitor opens `/` and sees the archive pitch, a featured interview record, archive totals, and entry points into the directory, question bank, analytics, and contribution flow.

- ID: home-overview
- Priority: high
- Status: verified
- Surfaces and roles: web / public visitor
- Source evidence: `apps/web/src/app/page.tsx`, `apps/web/src/app/layout.tsx`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Direct navigation to `/`.
- The brand link in the navbar from any page.
- The footer or "Back to top" anchor.

## Checks

- `home-render` in `verify/flows/home-render.json` — hero heading, featured record card, and archive statistics render from live data.
- `home-cta` in `verify/flows/home-cta.json` — the primary CTA opens the directory; the contribution CTA sends a guest to sign-in.

## Behavior variants

- Empty archive: statistics fall back to zero and the featured card is omitted. Not exercised in this run; the seeded archive always has records.
- Very long company or role names in the featured card.
- Mobile 390 × 844 reflow of the hero and the statistics strip.

## Gaps and assumptions

- The hero shows the first record returned by `getAllExperiences()`, which has no explicit ordering. The featured record is therefore not guaranteed stable across seeds.
- The "Share your experience" CTA points at a gated route, so a guest sees a redirect rather than the form. That is intended access control, not a broken link.
