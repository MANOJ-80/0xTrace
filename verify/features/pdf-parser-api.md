# PDF parser API

The FastAPI service validates an uploaded PDF and returns a structured draft. It is a separate service from the Next.js app and is exercised directly over HTTP.

- ID: pdf-parser-api
- Priority: normal
- Status: verified
- Surfaces and roles: api / integrator
- Source evidence: `apps/api/app/main.py`, `apps/api/app/config.py`, `apps/api/app/models.py`, `apps/api/app/pdf_text.py`, `apps/api/README.md`
- Last reviewed: 2026-11-09 (`987a5e4`)
- Last run: 2026-11-09-fresh-verify (see `verify/results/2026-11-09-fresh-verify/report.md`)

## Entry points

- `GET /health`
- `GET /openapi.json`
- `POST /api/v1/experiences/parse` with a multipart `file`

## Checks

- `pdf-health-contract` in `verify/flows/pdf-health-contract.json` — health returns the documented body and the OpenAPI document exposes the expected title and paths.
- `pdf-validation` in `verify/flows/pdf-validation.json` — a non-PDF filename and a file without a PDF signature are rejected with 415 and a JSON detail.
- `pdf-missing-key` in `verify/flows/pdf-missing-key.json` — a valid text PDF with no configured key returns 503 rather than a partial result.

## Behavior variants

- Oversized upload, which should return 413. Not exercised; it needs a file above the configured limit.
- A PDF with no extractable text, which should return 422.
- A configured key whose provider call fails, which should return 502.
- A successful parse with a real key and a synthetic text PDF.

## Gaps and assumptions

- No Groq key in this run, so the success and 502 branches are blocked.
- The service reads `apps/api/.env` when present. It is absent here; the run forced `GROQ_API_KEY` empty so a stray key could not trigger an external call.
- The Next.js `POST /api/extract` route duplicates part of this pipeline with a different contract. It is mapped under `experience-api` and is not the same check.
