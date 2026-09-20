"""Evidence-first PDF-to-canonical-experience extraction agent.

The LLM never supplies the text displayed by the application.  It returns an
extraction plan and field values; this service reconstructs every UI section
from immutable source spans extracted locally from the uploaded PDF.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile

from .canonical_api import ROOT, SCHEMA, _allowed_properties, _default, _experience_id, _merge
from .config import get_settings
from .semantic_viewer import _layout_text

app = FastAPI(title="0xTrace extraction agent", version="2.0.0")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
ROUND_TYPES = set(SCHEMA["$defs"]["round"]["properties"]["type"]["enum"])


@dataclass(frozen=True)
class SourceSpan:
    id: str
    kind: str
    heading: str
    text: str


# Covers: Round 1:, Round 1-, R1, Technical Round 1, HR Round, Tips, Contact, etc.
BOUNDARY = re.compile(
    r"(?im)^\s*(?:round\s*\d+\s*[-:.]|r\s*\d+\s*[-:.]|(?:technical|managerial|hr|online|coding|aptitude|group discussion|final)\s+round(?:\s*\d+)?\s*[-:.]|(?:insights?|tips|contact|linkedin|verdict|result|conclusion)\s*[:]|all\s+the\s+best[^\n]*)"
)


def make_source_spans(raw_text: str) -> list[SourceSpan]:
    """Make contiguous, lossless source spans; joining them always recreates raw_text."""
    matches = list(BOUNDARY.finditer(raw_text))
    if not matches:
        return [SourceSpan("s001", "document", "Document", raw_text)]
    starts = [match.start() for match in matches] + [len(raw_text)]
    chunks: list[tuple[str, str]] = []
    if starts[0]:
        chunks.append(("document", raw_text[:starts[0]]))
    chunks.extend(("section", raw_text[match.start():starts[index + 1]]) for index, match in enumerate(matches))
    spans = [SourceSpan(f"s{index:03d}", kind, _heading(text), text) for index, (kind, text) in enumerate(chunks, 1) if text]
    assert "".join(span.text for span in spans) == raw_text
    return spans


def _heading(text: str) -> str:
    first = next((line.strip() for line in text.splitlines() if line.strip()), "Document")
    return re.sub(r"\s+", " ", first).strip()[:160]


EXTRACTION_PROMPT = """You are the extraction planner in a lossless interview-PDF ingestion system.

Your job is to read the immutable source spans and return an extraction plan for ONE interview experience.
The application will display source text from the original spans, not from your output.

NON-NEGOTIABLE RULES
1. Return JSON only, matching the response contract below.
2. Never omit a source span: every source_span.id must appear exactly once either in one round.source_ids or in document_sections.
3. Never duplicate a source span across targets.
4. Do not paraphrase source text. Extract field values only when directly supported by the source; otherwise null, [], or "unknown".
5. Preserve complete questions and coding problems verbatim in `questions` and `coding.problems` when they are present.
6. A round.source_ids must contain the whole source material for that round. Keep source order.
7. Use only valid round types: online_assessment, aptitude, coding_test, technical_test, mcq, gamified_assessment, group_discussion, case_study, hackathon, machine_coding, system_design, technical_interview, managerial_interview, behavioral_interview, hr_interview, prompt_engineering, resume_screening, ppt, final_interview, combined_interview, other, unknown.
8. mode is only online, offline, virtual, physical, or null. employment_type is full_time, internship, internship_plus_fte, contract, part_time, or unknown.
9. Do not create a round just because a source span contains a shortlist, result, tip, contact, or conclusion.

RESPONSE CONTRACT
{
  "experience": {
    "candidate": {"name": null, "department": null, "degree": null, "college": null, "roll_no": null},
    "company": {"name": null, "normalized_name": null},
    "job": {"role": null, "employment_type": "unknown", "location": null},
    "timeline": {"month": null, "year": null, "dates": []},
    "eligibility": {"criteria": [], "cgpa": null, "percentage": null, "arrears_requirement": null, "branches": []},
    "compensation": {"ctc": null, "base_pay": null, "salary": null, "internship_stipend": null, "other": null},
    "pre_placement": [], "outcome": {"status": "unknown", "offer_type": null, "selected_count": null, "total_candidates": null, "details": null},
    "tips": [], "conclusion": null, "contacts": {"email": null, "phone": null, "linkedin": null}, "additional_information": []
  },
  "rounds": [{"name":"", "original_name":"", "type":"unknown", "date":null, "time":null, "mode":null, "platform":null, "venue":null, "duration":null, "difficulty":null, "sections":[], "topics":[], "questions":[], "coding":{"present":false,"language":null,"problems":[]}, "description":null, "shortlisting":{"attended":null,"selected":null,"eliminated":null,"details":null}, "result":null, "source_ids":[]}],
  "document_sections": [{"source_id":"", "type":"metadata|eligibility|compensation|pre_placement|outcome|tips|contacts|conclusion|additional_information|other", "title":""}]
}
"""


async def ask_agent(spans: list[SourceSpan], api_key: str) -> dict[str, Any]:
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    payload = {
        "source_spans": [{"id": span.id, "suggested_heading": span.heading, "text": span.text} for span in spans],
    }
    async with httpx.AsyncClient(timeout=150) as client:
        response = await client.post(GROQ_URL, headers={"Authorization": f"Bearer {api_key}"}, json={
            "model": model,
            "temperature": 0,
            "response_format": {"type": "json_object"},
            "messages": [{"role": "system", "content": EXTRACTION_PROMPT}, {"role": "user", "content": json.dumps(payload, ensure_ascii=False)}],
        })
    if response.is_error:
        raise HTTPException(status_code=502, detail=f"Extraction agent failed: {response.text[:400]}")
    try:
        return json.loads(response.json()["choices"][0]["message"]["content"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="Extraction agent returned invalid JSON.") from exc


def _normalize_round(plan: dict[str, Any], sequence: int, span_map: dict[str, SourceSpan]) -> dict[str, Any]:
    clean = _allowed_properties(SCHEMA["$defs"]["round"], plan)
    round_data = _merge(_default(SCHEMA["$defs"]["round"]), clean)
    source_ids = plan.get("source_ids", [])
    round_data["sequence"] = sequence
    round_data["name"] = round_data.get("name") or f"Round {sequence}"
    round_data["original_name"] = round_data.get("original_name") or round_data["name"]
    round_data["type"] = round_data["type"] if round_data.get("type") in ROUND_TYPES else "unknown"
    round_data["mode"] = (round_data.get("mode") or "").lower() or None
    if round_data["mode"] not in {"online", "offline", "virtual", "physical", None}:
        round_data["mode"] = None
    round_data["raw_content"] = "".join(span_map[source_id].text for source_id in source_ids)
    round_data["coding"]["problem_count"] = len(round_data["coding"].get("problems", []))
    return round_data


def build_document(filename: str, page_count: int, raw_text: str, spans: list[SourceSpan], plan: dict[str, Any]) -> dict[str, Any]:
    span_map = {span.id: span for span in spans}
    all_ids = set(span_map)
    used_ids: list[str] = []
    for item in plan.get("rounds", []):
        used_ids.extend(item.get("source_ids", []))
    used_ids.extend(item.get("source_id") for item in plan.get("document_sections", []))
    if None in used_ids or set(used_ids) != all_ids or len(used_ids) != len(all_ids):
        raise ValueError("Agent must assign every immutable source span exactly once.")

    extracted = _allowed_properties(SCHEMA["$defs"]["experience"], plan.get("experience", {}))
    experience = _merge(_default(SCHEMA["$defs"]["experience"]), extracted)
    experience["id"] = _experience_id()
    experience["source"]["experience_number"] = int(experience["id"].split("_")[-1])
    experience["raw_text"] = raw_text
    experience["rounds"] = [_normalize_round(item, index, span_map) for index, item in enumerate(plan.get("rounds", []), 1)]
    experience["quality"] = {"completeness": "high", "confidence": "medium", "issues": ["AI-extracted fields require review before canonical import."]}

    ui_sections: list[dict[str, Any]] = []
    for index, item in enumerate(plan.get("document_sections", []), 1):
        source = span_map[item["source_id"]]
        ui_sections.append({"id": f"document-{index:02d}", "order": index, "type": item["type"], "title": item.get("title") or source.heading, "source_ids": [source.id], "raw_content": source.text})
    offset = len(ui_sections)
    for round_data, plan_round in zip(experience["rounds"], plan.get("rounds", []), strict=True):
        ui_sections.append({"id": f"round-{round_data['sequence']:02d}", "order": offset + round_data["sequence"], "type": "round", "title": round_data["name"], "source_ids": plan_round["source_ids"], "raw_content": round_data["raw_content"]})
    ui_sections.sort(key=lambda section: min(spans.index(span_map[source_id]) for source_id in section["source_ids"]))
    for index, section in enumerate(ui_sections, 1): section["order"] = index

    reconstructed = "".join(section["raw_content"] for section in ui_sections)
    if reconstructed != raw_text:
        raise ValueError("Lossless source coverage check failed.")
    return {
        "dataset_metadata": {"dataset_name": "0xTrace Interview Experiences", "schema_version": "1.3", "source_type": "pdf_upload", "total_experiences": 1, "total_rounds": len(experience["rounds"])},
        "experiences": [experience],
        "ui_document": {"version": "1.0", "source": {"filename": filename, "page_count": page_count, "sha256": hashlib.sha256(raw_text.encode()).hexdigest(), "character_count": len(raw_text)}, "sections": ui_sections, "integrity": {"lossless": True, "source_span_count": len(spans), "assigned_source_span_count": len(used_ids)}},
    }


@app.post("/api/v1/experiences/extract")
async def extract(file: UploadFile = File(...)) -> dict[str, Any]:
    settings = get_settings()
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is required.")
    filename = file.filename or "upload.pdf"
    content = await file.read(settings.max_pdf_bytes + 1)
    if not filename.lower().endswith(".pdf") or not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="Only valid PDF uploads are supported.")
    if len(content) > settings.max_pdf_bytes:
        raise HTTPException(status_code=413, detail="PDF exceeds the configured upload limit.")
    try:
        raw_text = _layout_text(content)
        page_count = len(__import__("pypdf").PdfReader(BytesIO(content)).pages)
        spans = make_source_spans(raw_text)
        return build_document(filename, page_count, raw_text, spans, await ask_agent(spans, settings.groq_api_key))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Extraction pipeline failed: {exc}") from exc
