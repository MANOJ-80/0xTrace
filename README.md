# 0xTrace

> Campus interview experiences, organized for the next candidate.

0xTrace is a student-run archive of campus placement interviews. It keeps each
candidate's original writeup alongside structured company, round, question, and
outcome data, so you can read the full account or search across the archive.

**Live site:** [https://0x-trace.vercel.app/](https://0x-trace.vercel.app/)

---

## What you can do

### Browse interview experiences

- Search the directory by company, role, outcome, or candidate.
- Open a record for structured round summaries, questions, tips, and the
  candidate's original writeup.
- Compare the structured summary with the source account when a detail looks
  unclear.

### Search the question and coding bank

- Find technical and behavioral questions reported after real interviews.
- Filter by topic, difficulty, and company.
- Review coding problems with their descriptions and topics.

### Read placement patterns

- See company activity, interview round types, outcomes, and question topics
  across the archive.
- Use the summaries to spot trends, then open individual records for context.

### Share an experience manually

The contribution wizard walks through four steps:

1. **Basic info** — company, role, candidate details, timeline, and package.
2. **Rounds** — round names, types, modes, duration, difficulty, questions, and
   coding problems.
3. **Outcome and advice** — result, tips for future candidates, and pitfalls.
4. **Review** — check the full entry before publishing.

Each student account can publish one experience. You can edit or delete it later
from **My Experiences**.

### Turn a PDF into a draft

- Upload a text-based interview PDF and review the extracted company, rounds,
  questions, and outcome before publishing.
- Text is extracted with layout preserved. Scanned PDFs can use OCR when the
  optional Python parser and OCR tools are installed.
- An LLM fills in the parts that regex cannot handle reliably. If the model is
  unavailable, deterministic parsing still produces a usable draft.
- Candidate emails and phone numbers are masked in the structured output and
  raw text.
- PDF extraction is rate-limited per account.

### Manage your submissions

- View every experience you have shared from **My Experiences**.
- Edit or delete your own record at any time.

### Sign in with a college account

- Google sign-in is restricted to `@psgitech.ac.in` accounts.
- Signing in unlocks record details, the question bank, analytics, and
  contribution tools.

### Control what is public

- The public directory shows a summary card with company, role, year, outcome,
  round count, and a shortened candidate name.
- Full writeups, contact details, email addresses, and raw source text are
  available only to signed-in users.
- Authors can edit or delete their own record. Anyone can use the contact form
  to request a removal or correction.
- Experience pages include Open Graph previews for sharing.

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Web | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 3, Geist Sans and Geist Mono, Lucide icons |
| Data | MongoDB Atlas, Zod validation |
| Auth | NextAuth v4 with Google OAuth |
| PDF text | `unpdf`, optional `pdftotext`, `pypdf`, Tesseract OCR |
| Extraction | Groq by default, with Cohere, NVIDIA NIM, OpenRouter, and local Ollama fallbacks |
| Hosting | Vercel |

---

## Project structure

```text
0xTrace/
├── apps/
│   ├── api/        # Optional Python PDF text parser with OCR support
│   └── web/        # Next.js web application
├── docs/           # Extraction pipeline notes
├── scripts/        # Seed and test helpers
└── data/           # Local dataset and schema (not committed)
```

---

## Getting started

### Requirements

- Node.js 20 or newer
- A MongoDB Atlas cluster
- A Google OAuth client
- An LLM API key for PDF extraction (manual contributions work without one)

### 1. Install dependencies

```bash
cd apps/web
npm install
```

### 2. Configure the web app

Create `apps/web/.env.local`:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=0xtrace

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-string

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-120b
EXTRACTION_HOURLY_LIMIT=5
```

Add the Google OAuth redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Optional provider keys are tried in order after Groq:

```env
COHERE_API_KEY=...
NVIDIA_API_KEY=...
OPENROUTER_API_KEY=...

# Local model, opt-in only
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=...
```

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Optional: Python PDF parser

The web app falls back to `pdftotext` and `unpdf`, so this service is not
required. Install it when you want the layout-aware parser and OCR path.

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

For OCR, install `poppler` and `tesseract`. The web app also accepts a custom
Python path through `PDF_PYTHON`.

---

## Access model

| Area | Who can open it |
| --- | --- |
| Home, directory, about, privacy, terms, contact | Everyone |
| Experience details, question bank, analytics | Signed-in college accounts |
| Contribute, upload, my experiences | Signed-in college accounts |

Sign-in is limited to `@psgitech.ac.in` Google accounts.

---

## Data

MongoDB Atlas is the primary store. It holds the published experiences,
temporary extraction usage counters, and removal or correction requests. The
application validates structured records with Zod before writing them.

If you have a canonical JSON export, the seed helper can load it into MongoDB:

```bash
MONGODB_URI="mongodb+srv://..." node scripts/seed-mongodb.mjs
```

The local `data/` directory is excluded from version control because it contains
real candidate writeups and personal details.

---

## Checks

```bash
cd apps/web
npm run typecheck
npm run build
```

---

## Documentation

- [Extraction pipeline](docs/extraction-pipeline.md) — how a PDF becomes a
  structured, reviewable experience.
- [Python parser](apps/api/README.md) — the optional PDF text service.

---

## Feedback and contributions

Found a bug, spotted an incorrect record, or have an idea for the archive? Open
an issue on GitHub:

[https://github.com/MANOJ-80/0xTrace/issues/new/choose](https://github.com/MANOJ-80/0xTrace/issues/new/choose)

You can also use the contact form on the live site to request a removal or
correction.
