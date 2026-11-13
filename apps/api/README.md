# 0xTrace PDF parser API

This service accepts an interview-experience PDF and returns a structured, reviewable draft. It does not modify `data/canonical/interview_experiences_v1.3.json`; an explicit approval/import workflow should do that later.

## Run locally

```bash
cd apps/api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
# add GROQ_API_KEY to .env -- never commit this file
.venv/bin/uvicorn app.main:app --reload --port 8000
```

```bash
curl -X POST http://localhost:8000/api/v1/experiences/parse \
  -F "file=@../../data/sample.pdf"
```

```bash
.venv/bin/pytest -q
```

Native PDF text is extracted with `pypdf`. For scanned PDFs, the API runs OCR only when `pdftoppm` and `tesseract` are installed. Uploads are validated as PDFs, capped at 20 MiB by default, and processed in memory rather than persisted.
