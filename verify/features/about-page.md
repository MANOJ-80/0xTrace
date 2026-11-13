# About page

A public visitor reads what the archive is, what it is not, answers to common questions, and a way to report problems.

- ID: about-page
- Priority: normal
- Status: verified
- Surfaces and roles: web / public visitor
- Source evidence: `apps/web/src/app/about/page.tsx`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- Navbar "About" link.
- Footer "About" link.
- Direct navigation to `/about`.

## Checks

- `about-content` in `verify/flows/about-content.json` — the disclaimer, capability summary, and feedback link render.
- `about-faq` in `verify/flows/about-faq.json` — FAQ items expand and collapse and expose their answers.

## Behavior variants

- FAQ item expanded versus collapsed.
- External feedback link present but not followed during a local run.
- Mobile reflow of the feature grid and FAQ list.

## Gaps and assumptions

- The GitHub issue link points at an external host and is not followed; only its presence and `href` are checked.
- The contribution CTA on this page is gated, so a guest is redirected.
