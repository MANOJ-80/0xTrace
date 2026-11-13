# Crawler and social metadata

Search engines and link-preview clients receive a sitemap, crawl rules, and generated Open Graph images for the archive.

- ID: crawl-metadata
- Priority: low
- Status: verified
- Surfaces and roles: web / crawler
- Source evidence: `apps/web/src/app/robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `experiences/[id]/opengraph-image.tsx`, `apps/web/src/app/layout.tsx`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- `/robots.txt`
- `/sitemap.xml`
- `/opengraph-image`
- `/experiences/<id>/opengraph-image`

## Checks

- `crawl-metadata` in `verify/flows/crawl-metadata.json` — crawl rules disallow admin and API paths, the sitemap lists the public pages, and both Open Graph images return a raster image.

## Behavior variants

- Sitemap generated against the local base URL versus the configured production URL.
- Open Graph image for a record that no longer exists.
- A crawler user agent requesting a gated record, which the middleware allows for previews.

## Gaps and assumptions

- `metadataBase` falls back to a production URL when `NEXTAUTH_URL` is unset. The run sets it locally, so absolute URLs in the sitemap point at the local origin.
- The crawler bypass in `middleware.ts` is source-derived; no crawler user agent was simulated.
