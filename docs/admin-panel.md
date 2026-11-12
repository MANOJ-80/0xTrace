# Admin panel

## Surface

| Route | Purpose |
|---|---|
| `/admin` | Overview cards, outcome filters, searchable record table |
| `/admin/edit/[id]` | Structured record editor |
| `/admin/edit/[id]/raw` | Raw JSON fallback for the same record |
| `/admin/activity` | Append-only log of submissions, edits, and deletions |
| `/admin/duplicates` | Records sharing a company and candidate |
| `GET /api/admin/experiences` | Paginated rows with search, filters, and sorting |
| `POST /api/admin/experiences/bulk` | Delete up to 100 selected records |
| `GET /api/admin/overview` | Aggregate counts for the summary cards |
| `GET /api/admin/activity` | Paginated activity log |
| `GET /api/admin/duplicates` | Duplicate groups |
| `POST /api/admin/duplicates/merge` | Merge duplicate records into one target |
| `POST /api/admin/companies/normalize` | Recompute canonical company keys |
| `GET /api/admin/export?format=json\|csv` | Download the archive |

Authorization lives in `lib/admin-auth.ts`. The middleware guards `/admin`
pages; every route handler calls `requireAdmin()` itself because API routes are
reachable directly. Admin identity comes from `ADMIN_EMAILS`. Authors keep edit
and delete rights on their own records through the existing `PUT` and `DELETE`
handlers.

## List query

`getAdminExperiences` runs in MongoDB and returns only the columns the table
renders. Full writeups and rounds stay out of the response.

- `q` matches company, candidate, role, author email, or record ID. Input is
  escaped and capped at 100 characters.
- `outcome` matches `outcome.status` case-insensitively.
- `quality=flagged` selects records with quality issues or a score below 60.
- `quality=ok` selects the rest.
- `attention=1` selects records with quality issues, a score below 60, or a
  missing company, candidate, or role.
- `sort` accepts `recent`, `oldest`, `company`, `candidate`, and `quality`.
- `page` and `limit` paginate; the limit is capped at 100.

The overview counts total records, companies, submissions from the last seven
days, quality flags, missing roles, missing identities, and the distinct set
that needs attention.

Bulk delete removes matching `_id` values and legacy `id` strings, then updates
the dataset metadata and revalidates the public pages.

## Structured editor

`/admin/edit/[id]` renders the same `ManualEntryForm` authors use. Edit mode
merges into the stored document instead of replacing it, so fields the form does
not expose survive a save:

- `author`, `created_at`, and `source` metadata
- `contacts.email` and `contacts.phone`
- `eligibility`, `additional_information`, `pre_placement`
- `quality` and `raw_text`
- per-round metadata such as date, venue, and platform when the round order is
  unchanged

`/admin/edit/[id]/raw` keeps the JSON editor for repairs that the form cannot
express.

## Audit log

`lib/audit.ts` writes to the `activity_log` collection after successful creates,
updates, deletes, bulk deletes, and merges. Inserts are best-effort: an audit
failure logs and continues so it cannot roll back the action that triggered it.

Each entry records the actor, action, target record, company, candidate, affected
count, and a short detail string. The activity page filters by action and
paginates.

## Duplicate detection and merge

`findDuplicateGroups` groups records by lowercased, trimmed
`company.name` + `candidate.name` and returns pairs with more than one record.

Each row on `/admin/duplicates` has a merge action. That row becomes the target
and every other record in the group becomes a source. `mergeExperienceDocuments`
fills empty target fields from each source and keeps existing target values.
Tips, mistakes, and additional information are unioned. Rounds stay with the
target so the same interview is not duplicated. Each merged source adds a note to
`additional_information`, then the route deletes the source records, updates the
dataset count, and writes a `merge` activity entry.

The route rejects sources whose company or candidate no longer matches the
target, which catches stale duplicate pages.

## Company normalization

`lib/company.ts` turns a display name into a canonical key. It lowercases,
removes accents and punctuation, converts `&` to `and`, collapses whitespace, and
strips trailing legal suffixes such as `Ltd`, `Pvt`, `Inc`, `LLC`, and `Plc`.

`company.normalized_name` is written from that key on every new ingest.
`Normalize names` in the admin header runs
`POST /api/admin/companies/normalize`, which recomputes the stored key for every
record. Company stats and analytics group by the same key and show the most
common spelling, so `IDFC FIRST Bank` and `IDFC First Bank Ltd.` count as one
company.

## Export

`GET /api/admin/export?format=json` returns every stored document with `_id` as
a string. `format=csv` returns one row per record with company, candidate, job,
timeline, outcome, round and question counts, quality, author, and source
columns. Both set attachment headers and `Cache-Control: no-store`.

## Public API

`GET /api/experiences` returns the public shape from `lib/public-experience.ts`:
no `author.email`, no `contacts.email` or `contacts.phone`, and no `raw_text`.
`contacts.linkedin` remains available for attribution.

`GET /api/experiences/[id]` returns the full document only to the record's author
or an admin, because the structured and raw editors read from it. Everyone else
gets the public shape.

## Indexes

`scripts/seed-mongodb.mjs` creates indexes for `id`, `company.name`,
`company.normalized_name`, `outcome.status`, `job.role`, `created_at`,
`author.email`, `company.name + candidate.name`, `activity_log.created_at`,
`activity_log.action + created_at`, and the text fields. Search still uses
case-insensitive regex, which suits the current archive size. Switch to `$text`
when the collection grows enough for regex scans to matter.
