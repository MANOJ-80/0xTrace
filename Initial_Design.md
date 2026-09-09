
The key architectural decision is:

> **V1.3 JSON is immutable canonical source data. Everything the application does—Postgres records, search indexes, embeddings, analytics, AI answers—is a derived representation of that source.**

Your finalized dataset has **126 experiences, 476 rounds, 493 interview questions, and 173 coding problems**, with zero unknown round types and no material semantic issues. 

# 0xTrace — FINAL END-TO-END ARCHITECTURE

## 1. What 0xTrace actually is

Don't build this as just:

> "A website containing interview experiences."

That's too basic.

Build it as:

> **An evidence-grounded interview intelligence platform that transforms real interview experiences into searchable company intelligence, question intelligence, preparation paths, and personalized mock interviews.**

The product has **four layers**:

```text
                    ┌──────────────────────────┐
                    │         0xTrace           │
                    │   Interview Intelligence  │
                    └────────────┬─────────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             │                   │                   │
             ▼                   ▼                   ▼
       DISCOVER              PREPARE              PRACTICE
       companies             questions            mock interviews
       experiences           patterns             AI evaluation
       rounds                topics               adaptive difficulty
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 ▼
                         INTELLIGENCE ENGINE
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
              Search           RAG            Analytics
                 │               │               │
                 └───────────────┼───────────────┘
                                 ▼
                         Canonical Dataset
                           V1.3 — IMMUTABLE
```

---

# 2. Core product experience

A user should be able to come to 0xTrace and say:

### "I'm interviewing for TCS."

0xTrace should answer:

```text
TCS

Interview Intelligence
────────────────────────────────

Experiences             12
Companies/variants      ...
Rounds                  ...
Technical questions     ...
Coding problems         ...

Most common stages
────────────────────────────────
OA → Technical → HR

Frequently reported topics
────────────────────────────────
DSA
DBMS
OOP
OS
Projects
...

Questions reported
────────────────────────────────
• ...
• ...
• ...

Coding problems
────────────────────────────────
• ...
• ...

What candidates experienced
────────────────────────────────
[experience cards]
```

Then:

### "I have a technical interview in 5 days."

The user should be able to switch to:

```text
PREPARATION MODE

Day 1
├── DSA
├── Arrays
├── Trees
└── 10 reported questions

Day 2
├── DBMS
├── SQL
└── 12 reported questions

...

START MOCK INTERVIEW
```

That's the product.

---

# 3. Final architecture

```text
                         ┌──────────────────────┐
                         │       USER            │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Next.js Web       │
                         │       Frontend        │
                         └──────────┬───────────┘
                                    │
                       HTTPS / REST / SSE
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │        API Gateway           │
                     │       FastAPI Backend        │
                     └──────────────┬──────────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
       Search Service          Interview Service       AI Service
             │                      │                      │
             │                      │             ┌────────┴────────┐
             │                      │             │                 │
             ▼                      ▼             ▼                 ▼
        PostgreSQL              PostgreSQL     Retrieval          LLM
        + pgvector              + pgvector     pipeline
             │                      │             │
             └──────────────────────┼─────────────┘
                                    │
                                    ▼
                            Redis / Cache
                                    │
                                    ▼
                         Background Workers
                                    │
                                    ▼
                        Indexing / Embeddings
                                    │
                                    ▼
                      V1.3 Canonical Dataset
                         JSON — READ ONLY
```

---

# 4. Recommended technology stack

## Frontend

### Next.js

Use:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query
* Zod

Why?

You need:

* SEO-friendly company pages
* fast navigation
* server rendering
* dashboard UI
* search
* streaming AI responses
* responsive interface

---

# 5. Backend

Use:

### FastAPI + Python

Python makes sense because the AI/search/data layer will be Python-heavy.

Responsibilities:

```text
FastAPI
│
├── Authentication
├── Experiences API
├── Company API
├── Search API
├── Question API
├── Preparation API
├── Mock Interview API
├── AI/RAG API
├── Analytics API
└── Admin API
```

Don't put all logic inside route handlers.

Use:

```text
routes
   ↓
services
   ↓
repositories
   ↓
database
```

---

# 6. Database

Use:

## PostgreSQL

with:

## pgvector

This gives you:

* relational data
* filtering
* full-text search
* vector search
* metadata
* analytics

without immediately needing Elasticsearch + Pinecone + another database.

For your current dataset, **Postgres + pgvector is enough**.

---

# 7. Canonical data architecture

This part is extremely important.

Do **not** directly mutate V1.3.

```text
data/
│
├── canonical/
│   └── interview_experiences_v1.3.json
│
├── manifests/
│   └── dataset_manifest.json
│
├── processed/
│   ├── experiences.jsonl
│   ├── rounds.jsonl
│   ├── questions.jsonl
│   └── coding_problems.jsonl
│
└── embeddings/
    └── ...
```

The canonical file is:

```text
READ ONLY
```

---

# 8. Ingestion pipeline

When the application starts, don't have the frontend read JSON.

Instead:

```text
V1.3 JSON
    │
    ▼
Schema Validator
    │
    ▼
Normalizer
    │
    ├───────────────┐
    ▼               ▼
Experience       Round
Records          Records
    │               │
    ├───────┬───────┤
    │       │
    ▼       ▼
Questions  Coding Problems
    │       │
    └───┬───┘
        ▼
    Topic Mapping
        │
        ▼
    Search Documents
        │
        ▼
    Embeddings
        │
        ▼
 PostgreSQL + pgvector
```

---

# 9. Database schema

I'd use approximately this structure.

## `experiences`

```text
id
source_experience_number
candidate_name
candidate_department
college
company_name
company_normalized_name
role
employment_type
location
timeline_month
timeline_year
outcome_status
offer_type
selected_count
total_candidates
source_raw_text
dataset_version
created_at
updated_at
```

---

## `rounds`

```text
id
experience_id
sequence
name
original_name
type
date
time
mode
platform
venue
duration
difficulty
description
raw_content
```

---

## `questions`

```text
id
round_id
experience_id
text
normalized_text
question_type
source_order
embedding
```

---

## `coding_problems`

```text
id
round_id
experience_id
text
normalized_text
difficulty
source_order
embedding
```

---

## `topics`

```text
id
name
slug
parent_topic_id
```

Example:

```text
Computer Science
│
├── DSA
│   ├── Arrays
│   ├── Trees
│   ├── Graphs
│   └── Dynamic Programming
│
├── DBMS
│   ├── SQL
│   ├── Transactions
│   └── Indexing
│
├── Operating Systems
├── Computer Networks
├── OOP
└── System Design
```

---

## `question_topics`

```text
question_id
topic_id
confidence
source
```

---

## `coding_problem_topics`

```text
coding_problem_id
topic_id
confidence
source
```

---

# 10. Why topic mapping should be separate

Don't overwrite the source's `topics`.

For example:

```text
Canonical source:

"Xor related problem"
```

Application intelligence can derive:

```text
Bit Manipulation
├── XOR
└── Bitwise Operations
```

But that's a **derived classification**.

Never modify:

```text
V1.3
```

to make the classification prettier.

Instead:

```text
canonical_topic
derived_topic
```

remain separate.

---

# 11. Search engine

This is one of the most important components.

Don't build:

> vector search only.

Build:

# Hybrid Search

```text
User Query
    │
    ├───────────────┐
    ▼               ▼
Keyword Search   Vector Search
    │               │
    │               │
    └───────┬───────┘
            ▼
       Rank Fusion
            │
            ▼
      Re-ranking
            │
            ▼
       Final Results
```

---

# 12. Search modes

0xTrace should understand different search intents.

### Company search

```text
"Infosys"
```

### Role search

```text
"software engineer"
```

### Question search

```text
"binary tree interview questions"
```

### Coding search

```text
"DP problems asked in placement"
```

### Round search

```text
"HR questions"
```

### Natural language

```text
"companies where students were asked SQL and DBMS"
```

---

# 13. Search ranking

A useful ranking function:

```text
Final Score =
    0.35 semantic_similarity
  + 0.25 keyword_score
  + 0.15 company_match
  + 0.10 role_match
  + 0.10 topic_match
  + 0.05 freshness/relevance
```

Don't hard-code this forever.

Create a ranking configuration.

---

# 14. Search result document

Each indexed document should carry metadata.

Example:

```json
{
  "document_id": "question_exp_001_round_2_003",
  "type": "question",
  "experience_id": "exp_001",
  "company": "Acko Tech",
  "round_type": "technical_interview",
  "question": "Explain ...",
  "topics": ["OOP", "Java"],
  "dataset_version": "1.3"
}
```

This makes filtered retrieval extremely powerful.

---

# 15. RAG architecture

This is where 0xTrace becomes interesting.

Don't let an LLM directly answer from its general knowledge.

Use:

# Evidence-first RAG

```text
User
 │
 ▼
Query Understanding
 │
 ▼
Intent Detection
 │
 ▼
Filters
 │
 ▼
Hybrid Retrieval
 │
 ▼
Candidate Evidence
 │
 ▼
Re-ranking
 │
 ▼
Context Builder
 │
 ▼
LLM
 │
 ▼
Grounded Answer
 │
 ▼
Citations → Original Experience
```

---

# 16. Example RAG query

User:

> "What questions were asked in technical interviews for software roles?"

System retrieves:

```text
Experience 17
 └── Technical Round
      ├── Question A
      ├── Question B

Experience 31
 └── Technical Round
      ├── Question C

Experience 52
 └── Technical Round
      ├── Question D
```

Then the LLM produces:

```text
Candidates reported questions around:

• OOP
• DBMS
• DSA
• Projects
• OS

Examples:
...

These are based on reported experiences, not a prediction of
what a company will definitely ask.
```

That final sentence is important.

---

# 17. Evidence citations

Every AI answer should be able to trace back to:

```text
Company
    ↓
Experience
    ↓
Round
    ↓
Question
```

Example UI:

```text
AI Answer

Most reported technical questions involve
DSA, DBMS and project discussions.

Sources

┌──────────────────────────────┐
│ Acko Tech                    │
│ Technical Interview — R2     │
│ "Explain polymorphism..."    │
│ View experience →            │
└──────────────────────────────┘
```

This is how you prevent "AI made this up" problems.

---



# 0xTrace — New Experience Ingestion System

### Purpose

Allow an admin to upload a raw interview-experience document and have 0xTrace automatically transform it into the **same structured format used by the canonical dataset**, while preserving the original source and requiring validation/review before publication.

The feature is essentially:

> **Document → Raw Text → Structured Experience → Validation → Human Approval → Search/RAG/Analytics**

---

# 1. What the feature accepts

Admin can upload:

```text
PDF
DOCX
TXT
Markdown
```

Potential future support:

```text
HTML
Images / screenshots
Scanned PDFs
```

For scanned documents, OCR can be added later.

---

# 2. Upload interface

Admin goes to:

```text
/admin/experiences/import
```

UI:

```text
┌─────────────────────────────────────────────┐
│          Add Interview Experience           │
│                                             │
│  Upload a raw interview experience         │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │       Drop document here              │  │
│  │                                       │  │
│  │       PDF • DOCX • TXT • MD           │  │
│  │                                       │  │
│  │       [ Choose File ]                │  │
│  └───────────────────────────────────────┘  │
│                                             │
│             [ Start Processing ]            │
└─────────────────────────────────────────────┘
```

Before processing:

* filename
* file size
* file type
* upload status
* checksum/hash

should be recorded.

---

# 3. Original document preservation

Never throw away the uploaded document.

Store:

```text
original_document
raw_extracted_text
structured_extraction
validation_report
review_history
```

For example:

```text
uploads/
└── import_00042/
    ├── original.pdf
    ├── extracted.txt
    ├── structured.json
    └── validation.json
```

This gives you complete provenance.

---

# 4. Document parsing

The first processing stage is **not AI**.

It is deterministic extraction.

```text
Uploaded PDF
      ↓
PDF Parser
      ↓
Raw Text
```

For DOCX:

```text
DOCX
 ↓
DOCX parser
 ↓
Raw text
```

For TXT/MD:

```text
File
 ↓
Direct text extraction
```

The goal is:

> Extract as much source text as possible **without interpreting it**.

---

# 5. Raw-text normalization

After extraction, perform safe normalization:

```text
encoding cleanup
newline normalization
whitespace cleanup
page-break cleanup
broken character cleanup
```

But don't rewrite the meaning.

For example:

```text
Original:
Round 1:\n\nTechnical Interview

Normalized:
Round 1:

Technical Interview
```

Not:

```text
Round 1: Technical Interview
```

unless the transformation is demonstrably structural.

---

# 6. Experience detection

The parser then determines how many experiences are inside the uploaded document.

For example:

```text
Document
│
├── EXPERIENCE 1
│
├── EXPERIENCE 2
│
└── EXPERIENCE 3
```

This is important because one uploaded file might contain:

* one experience
* multiple experiences
* multiple candidate reports
* concatenated reports

The system should **not blindly assume one file = one experience**.

---

# 7. Structured extraction

Then the extraction engine converts raw text into your canonical structure.

Conceptually:

```text
Raw Text
   ↓
Extraction Model
   ↓
Experience Object
```

It extracts:

### Candidate

```text
name
department
degree
college
roll_no
```

### Company

```text
name
normalized_name
```

### Job

```text
role
employment_type
location
```

### Timeline

```text
month
year
dates
```

### Eligibility

```text
criteria
cgpa
percentage
arrears_requirement
branches
```

### Compensation

```text
ctc
base_pay
salary
internship_stipend
other
```

### Rounds

```text
sequence
name
original_name
type
date
time
mode
platform
venue
duration
difficulty
sections
topics
questions
coding
description
shortlisting
result
raw_content
```

### Final information

```text
outcome
tips
conclusion
contacts
additional_information
quality
raw_text
```

This keeps new experiences compatible with V1.3.

---

# 8. Critical extraction rule

The AI must follow:

> **Never infer information that isn't explicitly supported by the uploaded source.**

For example, if the document says:

```text
Technical round was difficult.
```

Don't generate:

```text
difficulty = Hard
```

unless the source explicitly supports that classification according to your extraction rules.

Similarly:

```text
Candidate discussed SQL.
```

doesn't automatically mean:

```text
coding problem = SQL
```

---

# 9. Round detection

This deserves its own pipeline.

The system identifies:

```text
Round 1
Round 2
Technical Interview
HR Round
Online Assessment
...
```

and determines where each round begins and ends.

Pipeline:

```text
Raw Text
   ↓
Round boundary detection
   ↓
Round segmentation
   ↓
Round classification
   ↓
Round extraction
```

---

# 10. Round classification

Map source terminology into the canonical controlled vocabulary.

Example:

```text
"Technical"
        ↓
technical_interview

"Online Test"
        ↓
online_assessment

"HR"
        ↓
hr_interview
```

But preserve:

```text
original_name
```

So you have:

```json
{
  "name": "Technical Interview",
  "original_name": "Tech Round"
}
```

The application gets consistency while the original wording remains recoverable.

---

# 11. Question extraction

Every round is processed for actual questions.

Example source:

```text
They asked me:

What is normalization?

Explain ACID properties.

Difference between process and thread.
```

becomes:

```text
questions:
[
  "What is normalization?",
  "Explain ACID properties.",
  "Difference between process and thread."
]
```

---

# 12. Coding problem extraction

Coding problems are kept completely separate.

Example:

```text
They asked me to implement binary search.
```

becomes:

```text
coding.problems:
[
  "Implement binary search."
]
```

while:

```text
What is binary search?
```

remains:

```text
questions:
[
  "What is binary search?"
]
```

This separation is one of the most important principles inherited from your V1.3 dataset.

---

# 13. Tip/advice detection

The system must distinguish:

```text
Interview question
```

from:

```text
Preparation advice
```

For example:

```text
"Practice medium-hard LeetCode problems before the interview."
```

belongs in:

```text
tips
```

not:

```text
coding.problems
```

This directly prevents the leakage problems that were specifically cleaned from earlier dataset versions.

---

# 14. Source provenance

Every extracted item should ideally be traceable back to the source.

For example:

```text
Question ID
    ↓
Experience
    ↓
Round
    ↓
Source document
    ↓
Source text location
```

For stronger implementation, store:

```text
source_document_id
source_start_offset
source_end_offset
source_page
```

when technically available.

Then the admin can click:

> **View source**

and see the exact source text.

---

# 15. Validation engine

After extraction:

```text
Structured Experience
        ↓
Validation Engine
```

Checks should include:

### Structural

```text
Required fields valid?
Schema valid?
IDs valid?
Round sequence valid?
```

### Semantic

```text
Spurious round?
Wrong round type?
Question/coding confusion?
Tip leakage?
Truncated question?
Duplicate question?
```

### Integrity

```text
Information lost?
Unsupported facts?
Metadata cross-contamination?
Outcome inconsistency?
```

---

# 16. Confidence scoring

Each extraction can receive confidence.

For example:

```text
Company       HIGH
Role          HIGH
Round type    HIGH
Questions     HIGH
Outcome       MEDIUM
Eligibility   LOW
```

This helps determine what requires human attention.

---

# 17. Automatic rejection conditions

The system should stop publication when serious issues are detected.

Example:

```text
CRITICAL

❌ Cannot identify company
❌ Round boundaries ambiguous
❌ Extraction contains unsupported facts
❌ Source text extraction failed
❌ Duplicate experience detected
❌ Major information loss detected
```

Then:

```text
PROCESSING FAILED
```

instead of publishing bad data.

---

# 18. Duplicate detection

Before adding a new experience:

```text
New Experience
      ↓
Company + role + candidate + text similarity
      ↓
Existing experiences
```

If similarity is high:

```text
⚠ Possible duplicate

Existing:
exp_042

Similarity:
91%

[Compare]
[Cancel]
[Publish Anyway]
```

Don't automatically delete it.

---

# 19. Human review

This is the most important safety layer.

Admin sees:

```text
IMPORT REVIEW
────────────────────────────

Company
Acko Tech

Role
Software Engineer

Rounds
3

Questions
14

Coding Problems
4

Outcome
Selected

────────────────────────────

⚠ 2 MEDIUM CONFIDENCE FIELDS

Outcome details
Round 3 classification

────────────────────────────

[Approve]
[Edit]
[Reject]
```

---

# 20. Side-by-side review

Best UI:

```text
┌──────────────────┬──────────────────────────┐
│ SOURCE            │ STRUCTURED              │
│                  │                          │
│ Raw document     │ Company: XYZ             │
│ text              │ Role: SDE               │
│                  │                          │
│ Round 1...        │ Round 1                 │
│                  │ Type: Coding             │
│ Question...       │                          │
│                  │ Questions:               │
│                  │ • ...                    │
│                  │                          │
│                  │ Coding:                  │
│                  │ • ...                    │
└──────────────────┴──────────────────────────┘
```

This makes human verification extremely fast.

---

# 21. Editing

Admin should be able to modify the **pending extraction**.

Not V1.3.

Example:

```text
Pending import
      ↓
Admin correction
      ↓
Approved structured object
      ↓
Published experience
```

The original upload remains unchanged.

---

# 22. Approval

When admin clicks:

> **Approve & Publish**

the system:

```text
Pending Experience
       ↓
Final validation
       ↓
Database insert
       ↓
Search indexing
       ↓
Embedding generation
       ↓
Analytics update
       ↓
PUBLISHED
```

---

# 23. Publication should be transactional

Don't do:

```text
DB insert
↓
embedding
↓
search
```

and leave the system half-updated if embedding fails.

Instead:

```text
Create publication job
        ↓
Database transaction
        ↓
Indexing job
        ↓
Embedding job
        ↓
Mark READY
```

Experience status:

```text
uploaded
parsing
extracted
validating
needs_review
approved
indexing
published
failed
rejected
```

---

# 24. Background processing

Document processing can take time, so don't block the HTTP request.

```text
Upload
  ↓
API returns job_id
  ↓
Worker processes document
  ↓
Frontend polls / streams status
```

UI:

```text
Processing Experience

✓ Uploaded
✓ Text extracted
✓ Experience detected
✓ Metadata extracted
✓ Rounds detected
● Validating
○ Indexing
○ Published
```

---

# 25. New experience pipeline

The complete pipeline becomes:

```text
                DOCUMENT
                   │
                   ▼
                UPLOAD
                   │
                   ▼
             FILE STORAGE
                   │
                   ▼
             TEXT PARSER
                   │
                   ▼
              RAW TEXT
                   │
                   ▼
         EXPERIENCE DETECTION
                   │
                   ▼
            AI EXTRACTION
                   │
                   ▼
          STRUCTURED JSON
                   │
                   ▼
             VALIDATION
                   │
             ┌─────┴─────┐
             │           │
          FAILED       PASSED
             │           │
             ▼           ▼
          REVIEW      DUPLICATE
             │           │
             │        CHECK
             │           │
             └─────┬─────┘
                   ▼
              HUMAN REVIEW
                   │
             ┌─────┴─────┐
             ▼           ▼
           EDIT        REJECT
             │
             ▼
          APPROVE
             │
             ▼
        FINAL VALIDATION
             │
             ▼
         POSTGRESQL
             │
      ┌──────┼─────────┐
      ▼      ▼         ▼
   Search  Vector   Analytics
    Index   Index
      │      │
      └──┬───┘
         ▼
      PUBLISHED
```

---

# 26. Data architecture

I'd explicitly introduce a **staging layer**.

```text
Canonical
   │
   └── V1.3 immutable

Incoming
   │
   └── Uploaded documents

Staging
   │
   └── AI extracted experiences

Production
   │
   └── Approved experiences
```

So:

```text
V1.3
+
Approved new experiences
        ↓
Production dataset
```

But V1.3 itself remains untouched.

---

# 27. Import database tables

Add:

### `document_imports`

```text
id
filename
mime_type
file_size
storage_path
checksum
status
created_by
created_at
completed_at
error
```

### `extraction_jobs`

```text
id
import_id
status
model
prompt_version
started_at
completed_at
error
```

### `extracted_experiences`

```text
id
import_id
experience_json
validation_status
confidence
review_status
reviewed_by
reviewed_at
```

### `extraction_issues`

```text
id
extracted_experience_id
severity
category
field
message
source_reference
resolved
```

This gives you an audit trail.

---

# 28. Extraction versioning

This is very useful later.

Store:

```text
extractor_version
prompt_version
schema_version
model_version
```

Example:

```text
Extractor: 1.0
Prompt: 3.2
Schema: 1.3
Model: ...
```

If extraction quality improves later, you can reproduce how an experience was created.

---

# 29. Admin import history

Create:

```text
/admin/imports
```

Example:

```text
Recent Imports

┌────────────┬──────────────┬──────────┬──────────┐
│ File       │ Company      │ Status   │ Date     │
├────────────┼──────────────┼──────────┼──────────┤
│ exp.pdf    │ Infosys      │ Published│ Today    │
│ report.docx│ TCS          │ Review   │ Today    │
│ amazon.txt │ Amazon       │ Rejected │ Yesterday│
└────────────┴──────────────┴──────────┴──────────┘
```

---

# 30. Important distinction: ingestion vs canonical dataset

Your architecture should explicitly show:

```text
                    0xTrace
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
  CANONICAL DATA                INGESTION SYSTEM
      V1.3                     New Documents
         │                           │
         │                      Parse / Extract
         │                           │
         │                        Validate
         │                           │
         │                       Human Review
         │                           │
         └──────────────┬────────────┘
                        ▼
                  PRODUCTION DATA
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
            Search     RAG     Analytics
```

---

# 31. Why this feature matters strategically

This transforms 0xTrace from:

> **a static dataset application**

into:

> **a continuously extensible interview intelligence platform.**

Today:

```text
126 experiences
```

Tomorrow:

```text
500
1,000
10,000+
```

The application architecture doesn't need to change.

You simply keep ingesting:

```text
Document
→ Extraction
→ Validation
→ Approval
→ Index
```

---

# 32. The golden rule

The feature should follow the exact philosophy that made V1.3 reliable:

> **AI can propose structure. Validation can detect problems. Humans approve publication. The source remains authoritative.**

So the final feature is not merely:

**"Upload PDF → AI parses it."**

It is:

### **Upload → Parse → Extract → Validate → Compare → Review → Approve → Index → Publish**




# 18. AI must distinguish three things

This is critical.

### Reported

```text
"Candidates reported being asked..."
```

### Derived

```text
"Across the dataset, this topic appears frequently..."
```

### Generated

```text
"Here is a practice question based on those topics..."
```

Never blur these.

---

# 19. Company Intelligence page

This should become one of your strongest pages.

```text
/company/[slug]
```

Example structure:

```text
──────────────────────────────────

Google

Interview Intelligence

[Overview] [Rounds] [Questions] [Coding] [Experiences]

──────────────────────────────────

Reported Experiences
        14

Reported Rounds
        38

Technical Questions
        91

Coding Problems
        27

──────────────────────────────────

Interview Process

OA
 ↓
Technical
 ↓
Managerial
 ↓
HR

──────────────────────────────────

Most Reported Topics

DSA             ██████████
DBMS            ████████
OOP             ██████
OS              █████
Projects        ████

──────────────────────────────────

Reported Questions

1. ...
2. ...
3. ...

──────────────────────────────────

Coding Problems

1. ...
2. ...
3. ...

──────────────────────────────────

Experiences

[Experience Card]
[Experience Card]
...
```

---

# 20. Experience page

URL:

```text
/experience/exp_001
```

Design:

```text
Acko Tech
Interview Experience

Candidate
BE CSE

August 2024

Outcome
Selected / Unknown / Rejected

────────────────────────

Interview Process

Round 1
Coding Test
90 min
Medium

Round 2
Technical Interview

Round 3
Managerial Interview

────────────────────────

Round 1

Topics
• Bit Manipulation

Coding Problems

• ...
• ...
• ...

────────────────────────

Round 2

Questions

• ...
• ...
• ...

────────────────────────

Candidate Tips

• ...
```

The raw content can be hidden behind:

> **View original report**

This maintains transparency.

---

# 21. Question intelligence page

This is another major feature.

```text
/questions
```

Filters:

```text
Company
Role
Round
Topic
Question type
Difficulty
```

Example:

```text
Most Reported Questions

#1
Explain normalization in DBMS

Asked in:
8 experiences

Companies:
...

Topics:
DBMS → Normalization

[View sources]
```

---

# 22. Question clustering

This is where AI adds genuine value.

Suppose source contains:

```text
"What is polymorphism?"

"Explain polymorphism."

"Explain runtime polymorphism."

"Difference between compile-time and runtime polymorphism."
```

Don't blindly merge these.

Create:

```text
Question Cluster
    │
    ├── canonical concept
    │
    ├── source variants
    │
    └── occurrence count
```

Example:

```text
Polymorphism

Reported variants: 7

1. What is polymorphism?
2. Explain polymorphism.
3. Runtime polymorphism?
4. Compile-time vs runtime polymorphism?
```

But preserve the original questions.

---

# 23. Coding intelligence

Create:

```text
/coding
```

with:

```text
Company
Topic
Difficulty
Round
Problem type
```

Example:

```text
Coding Problems

Two Sum
    Reported: 6
    Companies: ...

Tree Traversal
    Reported: 4

Jump Game variation
    Reported: 2
```

Again:

**reported problem ≠ generated problem.**

---

# 24. Preparation engine

This is where 0xTrace goes beyond a static website.

User enters:

```text
Target Company: XYZ
Role: Software Engineer
Interview: Technical
Days Available: 7
```

System calculates:

```text
Preparation Profile
```

based on actual reported evidence.

---

# 25. Preparation algorithm

```text
Company
   +
Role
   +
Round
   +
Dataset evidence
        │
        ▼
Question frequency
        │
        ▼
Topic frequency
        │
        ▼
Difficulty distribution
        │
        ▼
Preparation priorities
        │
        ▼
Study Plan
```

Example:

```text
7-Day XYZ Preparation

HIGH PRIORITY
██████████ DSA
████████ DBMS
██████ OOP

MEDIUM
████ OS
███ CN

LOW
██ System Design
```

---

# 26. Don't call it "prediction"

Never say:

> "You will be asked these questions."

Instead:

> **"Questions reported by candidates."**

And:

> **"Preparation priorities derived from reported experiences."**

This is much more defensible.

---

# 27. Mock Interview Engine

This is the AI feature.

```text
/mock
```

User chooses:

```text
Company
Role
Round
Difficulty
Duration
```

Example:

```text
Amazon
Software Engineer
Technical Interview
30 minutes
Medium
```

The engine retrieves relevant reported evidence.

Then:

```text
Question
   ↓
User answer
   ↓
Evaluation
   ↓
Follow-up question
   ↓
Evaluation
   ↓
Final report
```

---

# 28. Mock interview should be adaptive

Example:

```text
AI:
Explain polymorphism.

User:
...

AI:
Good. Now explain runtime polymorphism.

User:
...

AI:
What happens internally?

User:
...

AI:
Let's move to DBMS.
```

The next question depends on the previous answer.

---

# 29. Mock evaluation

Evaluate:

```text
Conceptual correctness
Communication
Completeness
Depth
Technical precision
Confidence indicators
```

Don't claim psychological measurements.

Just evaluate the answer content.

---

# 30. Final mock report

```text
MOCK INTERVIEW REPORT

Overall
78 / 100

Technical Knowledge
82

Communication
74

Depth
71

Strong Areas
✓ OOP
✓ DBMS

Weak Areas
⚠ Trees
⚠ SQL joins

Recommended Practice

1. Tree traversal
2. SQL joins
3. OOP design questions

Evidence
Based on reported questions from:
...
```

---

# 31. AI architecture

Keep AI behind an abstraction.

```text
AIProvider
│
├── OpenAIProvider
├── LocalProvider
└── MockProvider
```

Then your application doesn't depend directly on one model.

---

# 32. AI services

```text
ai/
│
├── query_understanding.py
├── retrieval.py
├── reranking.py
├── context_builder.py
├── answer_generator.py
├── question_generator.py
├── evaluator.py
└── citation_builder.py
```

---

# 33. Query understanding

Input:

> "What are the most common questions for Java developer interviews?"

Output:

```json
{
  "intent": "question_search",
  "role": "java developer",
  "round_type": "technical_interview",
  "topics": [],
  "company": null
}
```

Then retrieval knows what to search.

---

# 34. Intent types

Create a controlled set:

```text
company_search
experience_search
question_search
coding_search
round_search
topic_search
analytics
preparation
mock_interview
general_rag
```

---

# 35. AI safety / hallucination layer

Before returning an answer:

```text
Retrieved Evidence
       │
       ▼
Evidence Sufficiency Check
       │
    ┌──┴──┐
    │     │
Enough   Not enough
    │     │
    ▼     ▼
Answer   Say:
         "The dataset doesn't contain enough
          evidence to answer this reliably."
```

This is **very important for 0xTrace**.

---

# 36. Analytics dashboard

Create:

```text
/analytics
```

For dataset exploration.

Metrics:

```text
126 Experiences

476 Rounds

493 Questions

173 Coding Problems
```

Then:

```text
Round Distribution

Technical Interview     169
Online Assessment        83
HR                        74
Coding Test               40
Managerial                32
...
```

Those counts can be computed from the canonical dataset rather than manually maintained.

---

# 37. Topic analytics

```text
Top Interview Topics

DSA
DBMS
OOP
OS
CN
Java
Python
SQL
Projects
System Design
```

But be careful:

**Don't fabricate topic frequency from the source unless the application actually computes it.**

---

# 38. Admin system

You need an admin interface even if you're the only admin.

```text
/admin
```

Pages:

```text
Dashboard
Experiences
Companies
Rounds
Questions
Coding Problems
Topics
Search Index
Embeddings
Dataset Versions
Quality
```

---

# 39. Dataset versioning

This is one of the most important architectural decisions.

```text
dataset_versions

id
version
file_hash
experience_count
round_count
question_count
coding_problem_count
created_at
status
```

Example:

```text
V1.3
ACTIVE
126 experiences
476 rounds
493 questions
173 coding problems
```

Future:

```text
V1.4
V1.5
V2.0
```

But V1.3 remains immutable.

---

# 40. Re-indexing

When a new dataset version arrives:

```text
Upload V1.4
     │
     ▼
Validate
     │
     ▼
Create ingestion job
     │
     ▼
Build new DB snapshot
     │
     ▼
Generate embeddings
     │
     ▼
Run validation
     │
     ▼
Index
     │
     ▼
Switch ACTIVE version
```

Never partially overwrite production data.

---

# 41. Background worker

Use:

```text
Celery / RQ / Arq
```

with Redis.

Jobs:

```text
ingest_dataset
generate_embeddings
build_search_index
cluster_questions
calculate_statistics
rebuild_company_profiles
```

For your first implementation, **a simple Redis-backed worker is enough**.

---

# 42. Caching

Redis can cache:

```text
company profile
popular searches
question counts
analytics
AI retrieval results
```

Example:

```text
company:amazon:profile
questions:dbms:popular
analytics:overview
```

Use TTL where appropriate.

---

# 43. Authentication

Initially:

```text
Anonymous
```

should be able to:

* search
* browse
* view experiences
* view questions

Login becomes useful for:

```text
saved companies
saved questions
preparation plans
mock history
progress
```

---

# 44. User database

Eventually:

```text
users
profiles
saved_experiences
saved_questions
preparation_plans
mock_sessions
mock_answers
user_progress
```

---

# 45. User journey

The ideal journey:

```text
Landing
   │
   ▼
Search "TCS"
   │
   ▼
Company Intelligence
   │
   ├── Experiences
   ├── Questions
   ├── Coding
   └── Interview Process
          │
          ▼
     Prepare
          │
          ▼
     Study Plan
          │
          ▼
     Practice
          │
          ▼
     Mock Interview
          │
          ▼
     Performance Report
```

That's your complete product loop.

---

# 46. Frontend routes

I'd structure the application approximately like:

```text
/
├── /search
│
├── /companies
│   └── /[company]
│
├── /experiences
│   └── /[id]
│
├── /questions
│   └── /[id]
│
├── /coding
│   └── /[id]
│
├── /topics
│   └── /[topic]
│
├── /prepare
│
├── /prepare/[plan]
│
├── /mock
│
├── /mock/[session]
│
├── /dashboard
│
├── /analytics
│
└── /admin
```

---

# 47. Backend API

```text
/api/v1

GET  /experiences
GET  /experiences/{id}

GET  /companies
GET  /companies/{slug}

GET  /rounds/{id}

GET  /questions
GET  /questions/{id}

GET  /coding
GET  /coding/{id}

GET  /topics
GET  /topics/{slug}

POST /search

POST /ai/ask

POST /prepare/generate

POST /mock/start
POST /mock/{id}/answer
POST /mock/{id}/finish

GET  /analytics
```

Admin:

```text
POST /admin/datasets
POST /admin/ingest
POST /admin/reindex
GET  /admin/jobs
GET  /admin/quality
```

---

# 48. API response design

Don't return huge database objects.

For example:

```json
{
  "id": "exp_001",
  "company": {
    "name": "Acko Tech",
    "slug": "acko-tech"
  },
  "job": {
    "role": null
  },
  "timeline": {
    "month": "August",
    "year": "2024"
  },
  "outcome": {
    "status": "selected"
  },
  "round_count": 3
}
```

Then fetch round details separately.

This keeps payloads small.

---

# 49. Search API

Example:

```http
POST /api/v1/search
```

```json
{
  "query": "Java DBMS technical interview",
  "filters": {
    "company": null,
    "role": null,
    "round_type": "technical_interview",
    "topic": null
  },
  "page": 1,
  "limit": 20
}
```

Response:

```json
{
  "results": [],
  "total": 37,
  "query_id": "..."
}
```

---

# 50. Search result types

Every result has:

```text
experience
round
question
coding_problem
company
topic
```

So search becomes a unified discovery engine.

---

# 51. Observability

Don't skip this.

Use structured logs.

```text
request_id
user_id
endpoint
latency
retrieval_latency
llm_latency
tokens
error
```

Metrics:

```text
API latency
search latency
RAG latency
LLM failure rate
retrieval hit rate
```

---

# 52. RAG evaluation

This is particularly important for your resume.

Create a small evaluation dataset:

```text
eval/
├── questions.json
├── expected_sources.json
└── expected_behavior.json
```

Example:

```json
{
  "query": "What coding problems were reported for X?",
  "expected_sources": [
    "exp_012",
    "exp_034"
  ]
}
```

Measure:

```text
Retrieval Precision
Retrieval Recall
Citation Accuracy
Groundedness
Answer Relevance
```

This turns your AI feature into an actual engineering system rather than:

> "I connected an LLM to a vector database."

---

# 53. Search/RAG evaluation pipeline

```text
Evaluation Queries
       │
       ▼
Retriever
       │
       ▼
Top-K Results
       │
       ▼
Expected Evidence
       │
       ▼
Metrics
       │
       ▼
Dashboard
```

---

# 54. Security

Minimum:

```text
HTTPS
JWT/session authentication
RBAC
rate limiting
input validation
SQL injection protection
CORS
secret management
```

AI-specific:

```text
prompt injection protection
output validation
source grounding
maximum context size
rate limits
```

Never let user-provided text directly control internal system prompts.

---

# 55. Privacy

Candidate information in the dataset needs special handling.

The source schema can contain things such as:

```text
name
email
phone
LinkedIn
```

So don't expose everything indiscriminately.

Create a public/private policy.

For example:

```text
Public:
name if already intended for publication
company
experience
questions
rounds

Restricted:
phone
email
other direct contact information
```

This should be enforced at the API layer.

---

# 56. Deployment architecture

For the first serious deployment:

```text
                  Internet
                     │
                     ▼
               Cloudflare
                     │
             ┌───────┴───────┐
             ▼               ▼
          Next.js          FastAPI
             │               │
             │          ┌────┴────┐
             │          ▼         ▼
             │      PostgreSQL   Redis
             │          │
             │       pgvector
             │
             └──────────────┐
                            ▼
                       Object Storage
```

Background worker:

```text
Worker
  │
  ├── ingestion
  ├── embeddings
  ├── indexing
  └── analytics
```

---

# 57. Object storage

Store:

```text
canonical datasets
dataset manifests
evaluation datasets
exports
logs if needed
```

Use an object store rather than putting huge JSON blobs directly inside Postgres.

---

# 58. Repository structure

I'd build the project as a monorepo:

```text
0xTrace/
│
├── apps/
│   │
│   ├── web/
│   │   └── Next.js
│   │
│   └── api/
│       └── FastAPI
│
├── packages/
│   │
│   ├── schemas/
│   ├── types/
│   └── config/
│
├── services/
│   │
│   ├── ingestion/
│   ├── search/
│   ├── rag/
│   ├── embeddings/
│   ├── clustering/
│   ├── preparation/
│   └── mock/
│
├── data/
│   │
│   ├── canonical/
│   ├── processed/
│   └── manifests/
│
├── evaluation/
│   ├── retrieval/
│   ├── rag/
│   └── datasets/
│
├── infrastructure/
│   ├── docker/
│   ├── migrations/
│   └── deployment/
│
├── scripts/
│
├── tests/
│
├── docker-compose.yml
├── Makefile
├── README.md
└── .env.example
```

---

# 59. Backend structure

```text
apps/api/

app/
│
├── main.py
│
├── api/
│   └── v1/
│       ├── experiences.py
│       ├── companies.py
│       ├── questions.py
│       ├── coding.py
│       ├── search.py
│       ├── ai.py
│       ├── preparation.py
│       ├── mock.py
│       └── analytics.py
│
├── core/
│   ├── config.py
│   ├── security.py
│   └── logging.py
│
├── models/
│
├── schemas/
│
├── services/
│
├── repositories/
│
└── db/
```

---

# 60. Search service structure

```text
services/search/

├── query_parser.py
├── keyword_search.py
├── vector_search.py
├── filters.py
├── ranker.py
├── reranker.py
└── search_service.py
```

---

# 61. RAG service

```text
services/rag/

├── intent.py
├── retrieval.py
├── reranking.py
├── context.py
├── grounding.py
├── generation.py
├── citations.py
└── pipeline.py
```

Pipeline:

```text
query
 ↓
intent
 ↓
filters
 ↓
retrieve
 ↓
rerank
 ↓
context
 ↓
generate
 ↓
grounding check
 ↓
citations
 ↓
response
```

---

# 62. Data ingestion service

```text
services/ingestion/

├── loader.py
├── validator.py
├── parser.py
├── normalizer.py
├── topic_mapper.py
├── document_builder.py
├── embedder.py
└── pipeline.py
```

---

# 63. Important data principle

There are **three representations**:

### Layer 1 — Canonical

```text
V1.3 JSON
```

Truth.

### Layer 2 — Structured database

```text
PostgreSQL
```

Operational representation.

### Layer 3 — Intelligence index

```text
embeddings
clusters
search documents
derived topics
analytics
```

Derived intelligence.

Never mix these layers.

---

# 64. What AI should NOT do

Don't let AI:

❌ rewrite the canonical experiences
❌ invent missing interview rounds
❌ invent company processes
❌ "correct" candidate statements
❌ fabricate coding problems
❌ silently merge different questions
❌ claim predictions as facts

AI should primarily:

✅ retrieve
✅ classify
✅ cluster
✅ summarize
✅ explain
✅ generate practice questions
✅ conduct mock interviews
✅ analyze user answers

---

# 65. MVP

Don't build everything simultaneously.

The first actual release should be:

```text
V1.3 Dataset
       ↓
PostgreSQL
       ↓
Search
       ↓
Company Pages
       ↓
Experience Pages
       ↓
Question Explorer
       ↓
Coding Explorer
```

That's the **MVP**.

---

# 66. V1.5

Then:

```text
Hybrid Search
+
RAG
+
AI Q&A
+
Source citations
```

Now the product becomes intelligent.

---

# 67. V2

Then:

```text
User accounts
+
Preparation plans
+
Progress tracking
+
Mock interviews
```

---

# 68. V3

Then the serious intelligence layer:

```text
Question clustering
Topic graph
Company process graphs
Role-specific intelligence
Difficulty modelling
Personalized preparation
Adaptive mock interviews
Advanced analytics
```

---

# 69. The killer feature

If I had to choose **one feature that differentiates 0xTrace**, I'd make it:

# Evidence-Driven Interview Map

Instead of simply showing:

> "Amazon asks DSA."

Show:

```text
AMAZON
│
├── Online Assessment
│   ├── Arrays
│   ├── Graphs
│   └── Dynamic Programming
│
├── Technical
│   ├── DSA
│   ├── Projects
│   ├── OOP
│   └── DBMS
│
└── HR
    ├── Behavioral
    └── Relocation
```

And every node can be clicked:

```text
DSA
 ↓
Reported 23 times
 ↓
12 experiences
 ↓
18 question variants
 ↓
[View evidence]
```

That's much more compelling than another interview-experience website.

---

# 70. The intelligence graph

Eventually, your internal data model becomes:

```text
                    COMPANY
                       │
                       ▼
                    ROLE
                       │
                       ▼
                  EXPERIENCE
                       │
                       ▼
                     ROUND
                  /    |    \
                 /     |     \
                ▼      ▼      ▼
           QUESTION  CODING  TOPIC
                │      │       │
                └──────┼───────┘
                       ▼
                  QUESTION
                   CLUSTER
                       │
                       ▼
                PREPARATION
                       │
                       ▼
                 MOCK INTERVIEW
                       │
                       ▼
                   USER RESULT
```

This is the long-term architecture of 0xTrace.

---

# 71. One particularly important distinction

Your source dataset already deliberately preserves raw content and separates conceptual questions from actual coding implementations. For example, the schema has separate `questions` and `coding.problems` fields, while retaining round-level raw content. 

**The app should preserve that distinction all the way through the stack.**

Don't collapse everything into:

```text
content
```

because then your future analytics become garbage.

You want to answer questions like:

> "How many actual coding problems were reported?"

versus:

> "How many conceptual questions were reported?"

versus:

> "Which topics appeared in technical interviews?"

That separation is one of the strongest assets of the dataset.

---

# 72. Final architecture in one picture

```text
                           ┌──────────────────────┐
                           │       USER            │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │      NEXT.JS          │
                           │      WEB APP          │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │       FASTAPI         │
                           │      API LAYER        │
                           └──────────┬───────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
        EXPERIENCE API          SEARCH ENGINE             AI ENGINE
              │                       │                       │
              │                ┌──────┴──────┐        ┌───────┴──────┐
              │                │             │        │              │
              │             Keyword       Vector   RAG          Mock AI
              │                │             │        │              │
              │                └──────┬──────┘        └───────┬──────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      ▼
                              ┌───────────────┐
                              │  PostgreSQL   │
                              │   + pgvector  │
                              └───────┬───────┘
                                      │
                              ┌───────┴────────┐
                              ▼                ▼
                            Redis          Analytics
                              │
                              ▼
                           Workers
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
          Embeddings       Clustering       Indexing
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                  ┌────────────────────────┐
                  │  V1.3 CANONICAL DATA  │
                  │       IMMUTABLE        │
                  │                        │
                  │ 126 Experiences        │
                  │ 476 Rounds             │
                  │ 493 Questions          │
                  │ 173 Coding Problems    │
                  └────────────────────────┘
```

---

# 73. Final build philosophy

Bro, **don't overengineer the first commit.**

The architecture should *support* the final product, but implementation should happen in this order:

```text
PHASE 0
Canonical V1.3
      ↓
PHASE 1
Ingestion + PostgreSQL
      ↓
PHASE 2
Search + filters
      ↓
PHASE 3
Frontend discovery
      ↓
PHASE 4
Company/experience/question intelligence
      ↓
PHASE 5
Hybrid RAG
      ↓
PHASE 6
AI preparation
      ↓
PHASE 7
Mock interviews
      ↓
PHASE 8
Analytics + evaluation
      ↓
PHASE 9
Production hardening
```

And the **single most important rule for the entire codebase** is:

> **`interview_experiences_v1.3.json` is the immutable source of truth. The database, search index, embeddings, clusters, analytics, and AI outputs are derived artifacts.**

That gives 0xTrace a clean foundation: **forensic dataset → structured intelligence → evidence-grounded search → RAG → personalized preparation → adaptive mock interviews.**

This is the architecture I'd use as the **master technical blueprint** before opening Codex and actually building.
