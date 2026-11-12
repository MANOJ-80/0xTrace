# Extraction pipeline

The upload route turns a PDF into an experience draft in four stages. Only the
middle stage uses a model, and every step before it is deterministic, so a
provider outage downgrades detail instead of losing the upload.

```
PDF → text lines → document model → LLM detail pass → validation → preview
```

## 1. Text layer

`apps/api/app/pdf_text.py` extracts text with layout preserved:

1. `pdftotext -layout` (poppler) — keeps lines, bullets, and label/value columns.
2. `pypdf` — fallback when poppler is unavailable.
3. `pdftoppm` + `tesseract` — last resort for scanned PDFs.

Text is normalised first: CRLF, zero-width characters, soft hyphens, non-breaking
spaces, control characters, and runs of blank lines. The result carries a
`method` of `layout`, `native`, or `ocr`.

`route.ts` spawns the Python module with the PDF on stdin, so nothing is written
to disk. If the Python environment is missing, the route falls back to
`pdftotext -layout` directly.

## 2. Document model

`apps/web/src/lib/extraction/` turns the text into a line-oriented model:

| File | Responsibility |
|---|---|
| `text-lines.ts` | lines, indentation, bullets, zero-width removal |
| `fields.ts` | `Label: value` parsing, alias resolution, confidence, sanitizers |
| `rounds.ts` | heading grammar, round type, date/platform/duration |
| `outcome.ts` | result and advice section detection, selection counts |

Field confidence:

- `high` — an explicit label (`Company:`, `Package:`, `Role:`).
- `medium` — a document banner or the line under the title.
- `low` — missing or rejected by a sanitizer.

Round headings accept `Round 3: X`, `Round-1`, `Round - 1`, `1st Round`,
`SECOND ROUND`, and word ordinals.

## 3. LLM stage

The provider chain is Groq → Cohere → NVIDIA → OpenRouter, with retries and a
deadline (`apps/web/src/lib/llm-providers.ts`).

- **Header** runs when company, candidate, or role is not `high` confidence, and
  receives the header plus the first 700 characters of round 1. High-confidence
  regex values are kept; the model only repairs the rest.
- **Rounds** extract questions, coding problems, and section counts. Rounds
  longer than `MAX_ROUND_CHARS` are split and merged.
- **Tips/result** extract advice and the conclusion.

## 4. Validation

`parseExtractionResult` applies the zod schema; `cleanExtractedExperience`
normalises round names, deduplicates, and redacts contact details. Problems are
pushed into `pipeline.warnings` and shown in the preview instead of being
silently published.

## Evaluation

```bash
node eval/extraction/run.js                    # unpdf, the path Vercel runs
node eval/extraction/run.js --extractor=python # pdftotext layout text
node eval/extraction/run.js --extractor=both   # compare pass rates
node eval/extraction/run.js --verbose          # per-round detail
```

- `expectations.json` splits the fixtures into a **tuning** set and a
  **holdout** set. Caterpillar and Dover are holdouts and must not drive rule
  changes.
- Fixture PDFs are local files under `samplepdfs/` and `data/`. The runner
  prints `fixture not present, skipped` for any that are missing, so a fresh
  clone reports the cases it can run.
- The runner compiles the TypeScript chunker and PDF extractor, then checks
  company, candidate, role, CTC, round count, outcome, counts, tips, and
  structural invariants.
- `company_llm` / `candidate_llm` mark fields that the deterministic pass may
  leave empty because only the LLM can recover them.
- Default to `unpdf` because that is what production uses. The layout path can
  read a glyph that `unpdf` misses, and the reverse also happens: on
  `CAT_MOHNISH S.pdf`, `pdftotext` drops the leading `R` in `Round-3`, so the
  layout path finds two rounds where the document has three.

A fix that only makes one PDF pass is not a fix. Change a general rule, then run
the whole set on both extractors, holdouts included.

## Extraction quota

`apps/web/src/lib/extraction-quota.ts` caps `POST /api/extract` at five runs
per account per hour. Counters live in the `extraction_usage` collection with
one document per user and hour, guarded by a TTL index. Admins are exempt.
Override the limit with `EXTRACTION_HOURLY_LIMIT`. A rejected request returns
429 with a `Retry-After` header.
