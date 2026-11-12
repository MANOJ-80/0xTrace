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
updates, deletes, and bulk deletes. Inserts are best-effort: an audit failure
logs and continues so it cannot roll back the action that triggered it.

Each entry records the actor, action, target record, company, candidate, affected
count, and a short detail string. The activity page filters by action and
paginates.

## Duplicate detection

`findDuplicateGroups` groups records by lowercased, trimmed
`company.name` + `candidate.name` and returns pairs with more than one record.
The page links each record to its detail and structured editor. There is no
merge action yet; duplicates are resolved by editing or deleting from the group.

## Export

`GET /api/admin/export?format=json` returns every stored document with `_id` as
a string. `format=csv` returns one row per record with company, candidate, job,
timeline, outcome, round and question counts, quality, author, and source
columns. Both set attachment headers and `Cache-Control: no-store`.

## Indexes

`scripts/seed-mongodb.mjs` creates indexes for `id`, `company.name`,
`company.normalized_name`, `outcome.status`, `job.role`, `created_at`,
`author.email`, `company.name + candidate.name`, `activity_log.created_at`,
`activity_log.action + created_at`, and the text fields. Search still uses
case-insensitive regex, which suits the current archive size. Switch to `$text`
when the collection grows enough for regex scans to matter.

## Not built yet

- Merge action for duplicate groups.
- Company name normalization across spelling variants.
