# Feature map

- Discovery date: 2026-11-09
- Commit: `987a5e4`
- Last run: `2026-11-09-fresh-verify` — 21 of 21 runnable checks passed, 7 blocked on identity
- Capabilities mapped: 15
- Checks created: 28
- Runnable without an identity: 21
- Blocked on an institutional session or admin role: 7
- Sources examined: all of `apps/web/src`, `apps/api/app/main.py` plus config and models, `apps/api/tests` names, `scripts/seed-mongodb.mjs`, package manifests, `README.md`, `apps/api/README.md`, `.env` variable names, and live route probing on the local build.
- Not examined live: signed-in and admin pages, write success paths, Groq success path, oversized upload, crawler user agent.

## Coverage

| Priority | Features |
|---|---|
| critical | 4 |
| high | 6 |
| normal | 4 |
| low | 1 |

| Status | Features | Meaning |
|---|---|---|
| ready | 0 | A runnable check exists and the surface is reachable |
| blocked | 7 | The surface needs an identity this run does not have |
| mapped | 0 | — |
| verified | 8 | Every runnable check passed in `2026-11-09-fresh-verify` |
| stale | 0 | — |
| broken | 0 | — |

## Features

| ID | Capability | Surface | Priority | Status | Checks |
|---|---|---|---|---|---|
| home-overview | Home and archive overview | web | high | verified | [home-render](../flows/home-render.json), [home-cta](../flows/home-cta.json) |
| experience-directory | Browse, search, filter, and sort records | web | critical | verified | [directory-browse](../flows/directory-browse.json), [directory-search](../flows/directory-search.json), [directory-empty](../flows/directory-empty.json), [directory-deep-link](../flows/directory-deep-link.json) |
| experience-detail | Read a full interview record | web | critical | blocked | [detail-guest-gate](../flows/detail-guest-gate.json), [detail-content](../flows/detail-content.json) |
| about-page | Read about the archive | web | normal | verified | [about-content](../flows/about-content.json), [about-faq](../flows/about-faq.json) |
| site-navigation | Move between top-level pages | web | high | verified | [nav-desktop](../flows/nav-desktop.json), [nav-mobile](../flows/nav-mobile.json) |
| authentication-gate | Sign-in gate, login page, access denied | web | critical | verified | [auth-guest-redirects](../flows/auth-guest-redirects.json), [auth-login-page](../flows/auth-login-page.json), [auth-unauthorized](../flows/auth-unauthorized.json) |
| question-bank | Search questions and coding problems | web | critical | blocked | [question-bank-search](../flows/question-bank-search.json) |
| analytics-dashboard | Review placement analytics | web | high | blocked | [analytics-render](../flows/analytics-render.json) |
| contribute-form | Submit an experience manually | web | high | blocked | [contribute-submit](../flows/contribute-submit.json) |
| upload-page | Read the PDF upload placeholder | web | normal | blocked | [upload-page-content](../flows/upload-page-content.json) |
| my-experiences | Manage own contributed records | web | high | blocked | [my-experiences-list](../flows/my-experiences-list.json) |
| admin-management | Administer records | web | high | blocked | [admin-dashboard](../flows/admin-dashboard.json) |
| experience-api | Public read and protected write contract | api | normal | verified | [api-list-contract](../flows/api-list-contract.json), [api-detail-404](../flows/api-detail-404.json), [api-protected-writes](../flows/api-protected-writes.json) |
| pdf-parser-api | PDF validation and parse contract | api | normal | verified | [pdf-health-contract](../flows/pdf-health-contract.json), [pdf-validation](../flows/pdf-validation.json), [pdf-missing-key](../flows/pdf-missing-key.json) |
| crawl-metadata | Sitemap, robots, and Open Graph images | web | low | verified | [crawl-metadata](../flows/crawl-metadata.json) |

## Capabilities without a check

None. Every mapped capability has at least one check.

## Blocked checks and why

| Check | Blocker |
|---|---|
| detail-content | No institutional Google identity |
| question-bank-search | Same |
| analytics-render | Same |
| contribute-submit | Same, plus a database write |
| upload-page-content | Same |
| my-experiences-list | Same |
| admin-dashboard | Same, plus admin membership |

The guest branch of every gated route is still covered by `auth-guest-redirects` and `detail-guest-gate`.

## Edge-case coverage decisions

| Dimension | Applies to | Decision |
|---|---|---|
| Empty and no-result states | directory, question bank, my experiences | Covered for the directory; recorded gap for gated pages |
| Validation | contribute form, ingest API | Blocked on identity for the form; 401 covered at the API |
| Long input | directory search, contribute form | Recorded gap; no length limits exist in source |
| Role denial | every gated route | Guest gate covered; signed-in non-owner and non-admin denied paths are recorded gaps |
| Direct deep link | directory, detail | Covered |
| Unknown route and unknown id | detail, API | Covered for the API; the page path redirects a guest before the 404 can render |
| Network and dependency failure | data reads, PDF service | Recorded gap; no fault injection this run |
| Concurrency and double submit | contribute form | Recorded gap |
| Viewport and keyboard | all public pages | Desktop and mobile covered; keyboard-only navigation recorded gap |
| Persistence | ingest, edit, delete | Blocked on identity |
| Destructive actions | delete in detail and admin | Blocked on identity; confirmation is source-derived |

## Unexamined source areas

- `apps/api/app/agent_pipeline*.py`, `canonical_api*.py`, `raw_*`, `semantic_viewer*`, and `ui_document.py` are not wired to any web route or to `main.py`. They are excluded from the map.
- `apps/api/tests` were read for discovery signals only; they are not run as part of this inventory.
- No load, accessibility, or security review was performed. Those belong to their own skills.
