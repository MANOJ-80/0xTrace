# 0xTrace application map

- Discovery date: 2026-11-09
- Commit under test: `987a5e4` (`feat(about): add GitHub feedback link`); working tree has untracked `.agents/`, `AGENTS.md`, two PDFs, and this `verify/` directory
- Purpose: campus placement interview archive for PSG iTech students, with experience records, a question bank, analytics, and manual contribution
- Surfaces: Next.js 14 web app (`apps/web`), Next.js route handlers under `apps/web/src/app/api`, FastAPI PDF parser (`apps/api`)
- Data: MongoDB database `0xtrace` with collections `experiences` and `metadata`
- Auth: Google OAuth through NextAuth, restricted to `@psgitech.ac.in`; admin flag from `ADMIN_EMAILS`
- Browser tooling in this host: `puppeteer-core` (project devDependency) with `/usr/bin/google-chrome`; Playwright browsers exist but Playwright is not installed in this project

## Routes and page groups

| Route | Access | Purpose | Key states | Source |
|---|---|---|---|---|
| `/` | Public | Archive overview with featured record and archive statistics | Loaded, empty archive, long company names | `src/app/page.tsx` |
| `/about` | Public | Product explanation, disclaimer, FAQ, feedback link | FAQ expanded/collapsed | `src/app/about/page.tsx` |
| `/experiences` | Public | Searchable, filterable directory of records | Loaded, filtered, no results, deep link `?company=` | `src/app/experiences/page.tsx`, `ExperienceDirectoryClient.tsx` |
| `/experiences/[id]` | Signed-in | Full record with rounds, tips, and original writeup | Loaded, missing record, round modal | `src/app/experiences/[id]/page.tsx`, `ExperienceDetailView.tsx` |
| `/experiences/[id]/edit` | Signed-in (author or admin) | Edit a record | Loaded, forbidden | `src/app/experiences/[id]/edit/page.tsx` |
| `/questions` | Signed-in | Question and coding-problem bank | Loaded, filtered, no results | `src/app/questions/page.tsx`, `QuestionBankClient.tsx` |
| `/analytics` | Signed-in | Placement analytics dashboard | Loaded | `src/app/analytics/page.tsx` |
| `/contribute` | Signed-in | Manual experience entry form | Blank, validation, submit success | `src/app/contribute/page.tsx`, `ManualEntryForm.tsx` |
| `/upload` | Signed-in | PDF extraction placeholder page | Static "in development" | `src/app/upload/page.tsx` |
| `/my-experiences` | Signed-in | Records owned by the session user | Loaded, empty | `src/app/my-experiences/page.tsx` |
| `/admin` | Admin | Experience manager | Loading, loaded, delete confirmation | `src/app/admin/page.tsx`, `AdminDashboardClient.tsx` |
| `/admin/edit/[id]` | Admin | Admin edit form | Loaded, forbidden | `src/app/admin/edit/[id]/page.tsx` |
| `/login` | Public | Google sign-in entry | Rendered, callback URL preserved | `src/app/login/page.tsx` |
| `/unauthorized` | Public | Non-institutional account rejection | Static | `src/app/unauthorized/page.tsx` |
| `/robots.txt`, `/sitemap.xml`, `/opengraph-image` | Public | Crawler and social metadata | Generated | `src/app/robots.ts`, `sitemap.ts`, `opengraph-image.tsx` |
| `GET /api/experiences` | Public | Paginated list with search and filters | Page, limit, empty result | `src/app/api/experiences/route.ts` |
| `GET /api/experiences/[id]` | Public | Single record by ObjectId or legacy `exp_XXX` | Found, 404 | `src/app/api/experiences/[id]/route.ts` |
| `PUT`/`DELETE /api/experiences/[id]` | Signed-in author or admin | Update or delete a record | 401, 403, 404, success | same route |
| `GET /api/experiences/user` | Signed-in | Records owned by the session user | 401, list | `src/app/api/experiences/user/route.ts` |
| `POST /api/canonical/ingest` | Signed-in | Create a record from a reviewed draft | 400, 401, success | `src/app/api/canonical/ingest/route.ts` |
| `POST /api/extract` | Signed-in | PDF to structured draft through Groq | 400, 401, 422, 503 | `src/app/api/extract/route.ts` |
| `GET /health` (FastAPI, separate port) | Public | Parser readiness | `{"status":"ok"}` | `apps/api/app/main.py` |
| `POST /api/v1/experiences/parse` (FastAPI) | Public | PDF parse contract | 415, 413, 422, 503, 502, success | `apps/api/app/main.py` |

## Access model observed at runtime

The middleware matcher covers `/contribute`, `/upload`, `/my-experiences`, `/admin/:path*`, `/experiences/:path+`, `/questions`, and `/analytics`. A guest request to any of those returns a 307 to `/login?callbackUrl=<path>`; `/admin` additionally redirects authenticated non-admins to `/`.

Consequence for verification: the record detail page and every "signed-in" page are unreachable without an approved institutional identity. The directory itself, the public read API, and the metadata routes are reachable anonymously.

## User journeys

| Journey | Priority | Role | Routes | Notes |
|---|---|---|---|---|
| Understand the archive and browse the directory | critical | Public visitor | `/`, `/experiences` | Fully reachable without auth |
| Search, filter, and sort the directory | critical | Public visitor | `/experiences` | Client-side filtering over server-provided records |
| Open and read a record | critical | Signed-in user | `/experiences/[id]` | Gated; needs an institutional session |
| Find a question or coding problem | critical | Signed-in user | `/questions` | Gated |
| Review placement patterns | high | Signed-in user | `/analytics` | Gated |
| Share an experience | high | Signed-in user | `/contribute` | Gated; writes to the database |
| Manage own records | high | Signed-in user | `/my-experiences`, `/experiences/[id]/edit` | Gated; owner-scoped |
| Administer records | high | Admin | `/admin`, `/admin/edit/[id]` | Gated; admin-scoped |
| Parse a PDF | normal | Integrator | FastAPI port | Service contract; success needs a Groq key |

## External dependencies

| Dependency | Used by | Local substitute | Limits |
|---|---|---|---|
| MongoDB | All data reads and writes | Local `mongo:7.0` container on `127.0.0.1:27018` seeded from `data/canonical/interview_experiences_v1.3.json` | Canonical dataset is real candidate data; it stays inside the local container |
| Google OAuth | Sign-in | None | Cannot be stubbed; institutional identity required |
| Groq LLM | PDF extraction success path | None | No key in this run; only error paths are verifiable |
| Google Fonts via `geist` | Typography | Bundled by `geist/font` | Not a runtime network call in this build |

## Discovery ledger

- Sources examined: every file under `apps/web/src` (routes, components, `middleware.ts`, `lib/auth.ts`, `lib/data.ts`, `lib/mongodb.ts`, API route handlers), `apps/api/app/main.py`, `config.py`, `models.py`, `requirements.txt`, `apps/api/tests`, `scripts/seed-mongodb.mjs`, `package.json` files, `README.md`, `apps/api/README.md`, `Initial_Design.md` (structure only), and `.env` variable names.
- Sources unavailable: deployed OAuth configuration, production environment, admin identity list values, Groq key.
- Excluded from this map: Next.js internal build routes, `_next/*` assets, and the unused `apps/api` viewer modules that no web route calls.
- Unresolved: whether the archive is intended to be fully private. The directory is public while every record requires sign-in, so a guest can see cards but cannot open one.
- Not examined live: signed-in pages, admin pages, write paths, and the Groq success path (no identity or key in this run).
