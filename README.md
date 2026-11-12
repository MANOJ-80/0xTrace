# 0xTrace 

> A platform to preserve, analyze, and share campus placement interview experiences.

0xTrace is a centralized vault for interview experiences. It features an automated AI extraction pipeline that parses raw candidate PDFs into a highly structured, searchable format while strictly preserving the original verbatim text. It serves as an interactive directory and question bank to help future candidates prepare for their campus placements.

---

## ✨ Features

- **AI Extraction Studio (`/upload`)**: Upload raw interview PDFs and extract structured data (rounds, coding problems, questions, outcomes) using the Groq LLM API. Features an interactive review workbench before database ingestion.
- **Experience Directory (`/experiences`)**: A comprehensive, searchable database of past interview experiences. Filter by company, outcome (Selected/Rejected), role, or candidate name.
- **Question & Coding Bank (`/questions`)**: An aggregated repository of 490+ interview questions and 170+ coding problems drawn directly from real interviews. Filter by difficulty, topic (OS, DBMS, System Design), and company.
- **Analytics Dashboard (`/analytics`)**: Detailed statistics and visualizations of the hiring landscape, including company-wise breakdowns, round type distributions, and outcome percentages.
- **Manual Contribution (`/contribute`)**: A 4-step wizard allowing users to manually submit their interview walkthroughs, complete with dynamic round configurations.
- **Admin Dashboard (`/admin`)**: Secure interface to manage the platform's data. View, edit (via raw JSON editor), and delete experiences directly from the database.
- **Privacy First (PII Scrubbing)**: Built-in redaction pipeline that automatically masks candidate emails and phone numbers from both the structured JSON and the verbatim raw text.

---

## 🛠️ Tech Stack

**Frontend (Web)**
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Typography**: Geist Sans & Geist Mono
- **Icons**: Lucide React
- **Validation**: Zod

**Backend (API & Database)**
- **Database**: MongoDB Atlas (Primary Data Store)
- **AI Extraction**: Groq SDK (`llama-3.3-70b-versatile`)
- **PDF Processing**: Python FastAPI, `pypdf`, Tesseract OCR

---

## 📂 Project Structure

```text
0xTrace/
├── apps/
│   ├── api/                          # FastAPI Python backend (PDF parsing, OCR)
│   └── web/                          # Next.js 14 frontend web application
├── data/
│   ├── canonical/                    # Legacy JSON dataset backups
│   ├── audits/                       # Semantic audits & schema validation reports
│   └── schema/                       # JSON Schema definition
└── scripts/                          # Seeding (seed-mongodb.mjs) and testing scripts
```

---

## 🎨 Design System

0xTrace uses a custom **Graphite & Signal** palette with Neo-brutalist elements:
- **Graphite Backgrounds**: Deep obsidian (`ox-void`), elevated surfaces (`ox-surface`).
- **Signal Accents**: Electric blue (`ox-accent`), Emerald green for success (`ox-signal-pass`), Vibrant red for rejections (`ox-signal-fail`), and Amber for warnings (`ox-signal-warn`).
- **Tactile UI**: Hard borders (`border-ox-edge`) and Neo-brutalist offset shadows (`shadow-neo`) for interactive elements.

---

## 🚀 Getting Started

### 1. Web Application (Next.js)

Navigate to the web app directory and install dependencies:
```bash
cd apps/web
npm install
```

Set up your environment variables. Create an `apps/web/.env.local` file:
```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
MONGODB_URI=mongodb+srv://...
ADMIN_PASSWORD=your_admin_password
EXTRACTION_HOURLY_LIMIT=5
```

Run the development server:
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 2. PDF Extraction API (FastAPI) - *Optional*

The Python backend is primarily used for parsing raw text/OCR from PDFs before passing it to the Next.js app for LLM extraction.

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create an `apps/api/.env` file:
```env
MAX_PDF_BYTES=20971520
```

Start the API:
```bash
uvicorn app.main:app --reload --port 8000
# API runs on http://localhost:8000
```

---

## 📊 Data Architecture

0xTrace currently uses a flat-file JSON architecture to store canonical data. 
- **Location**: `data/canonical/interview_experiences_v1.3.json`
- **Integrity**: The dataset is fully validated against `data/schema/schema.json`.
- **Scale**: Currently holds 120+ experiences, 470+ rounds, and 490+ questions. Ingestion scripts automatically back up the previous state before atomically writing new entries.

---

## 📜 License

Private Repository. All rights reserved.
