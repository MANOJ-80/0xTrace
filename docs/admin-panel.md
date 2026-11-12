# Admin panel

## Surface

| Route | Purpose |
|---|---|
| `/admin` | Overview cards, outcome filters, searchable record table |
| `GET /api/admin/experiences` | Paginated rows with search, filters, and sorting |
| `POST /api/admin/experiences/bulk` | Delete up to 100 selected records |
| `GET /api/admin/overview` | Aggregate counts for the summary cards |

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

## Indexes

`scripts/seed-mongodb.mjs` creates indexes for `id`, `company.name`,
`company.normalized_name`, `outcome.status`, `job.role`, `created_at`,
`author.email`, and the text fields. Search still uses case-insensitive regex,
which suits the current archive size. Switch to `$text` when the collection
grows enough for regex scans to matter.

## Not built yet

- Structured admin editor. The table links to the JSON editor today; authors
  already use `ManualEntryForm` through `/experiences/[id]/edit`.
- Audit log for edits and deletions.
- Duplicate detection beyond the `source.sha256` check on ingest.
- JSON and CSV export, and company name normalization.
