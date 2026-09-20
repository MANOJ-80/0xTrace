"""Resilient production endpoint for the evidence-first extraction agent."""

from __future__ import annotations

import hashlib
import re
from io import BytesIO
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile

from .agent_pipeline import SourceSpan, _normalize_round, ask_agent, make_source_spans
from .canonical_api import SCHEMA, _allowed_properties, _default, _experience_id, _merge
from .config import get_settings
from .semantic_viewer import _layout_text

app = FastAPI(title="0xTrace extraction agent", version="2.1.0")


def _section_for(span: SourceSpan) -> tuple[str, str]:
    heading = span.heading.lower()
    if "tip" in heading or "insight" in heading:
        return "tips", "Tips"
    if "contact" in heading or "linkedin" in heading:
        return "contacts", "Contact"
    if "all the best" in heading:
        return "conclusion", "Conclusion"
    if "verdict" in heading or "result" in heading:
        return "outcome", "Outcome"
    return "additional_information", span.heading


def repair_plan(spans: list[SourceSpan], plan: dict[str, Any]) -> list[str]:
    """Ensure no span can be lost when a model omits or duplicates an ID."""
    valid = {span.id for span in spans}
    claimed: set[str] = set()
    notices: list[str] = []
    plan.setdefault("rounds", [])
    plan.setdefault("document_sections", [])
    for round_plan in plan["rounds"]:
        source_ids: list[str] = []
        for source_id in round_plan.get("source_ids", []):
            if source_id in valid and source_id not in claimed:
                source_ids.append(source_id)
                claimed.add(source_id)
        round_plan["source_ids"] = source_ids
    filtered = []
    for item in plan["document_sections"]:
        source_id = item.get("source_id")
        if source_id in valid and source_id not in claimed:
            filtered.append(item)
            claimed.add(source_id)
    plan["document_sections"] = filtered
    for span in spans:
        if span.id in claimed:
            continue
        match = re.match(r"(?i)^round\s*(\d+)", span.heading)
        if match:
            number = int(match.group(1))
            existing = next((item for item in plan["rounds"] if re.search(rf"(?i)round\s*{number}(?:\D|$)", f"{item.get('name', '')} {item.get('original_name', '')}")), None)
            if existing is None:
                existing = {"name": span.heading, "original_name": span.heading, "type": "unknown", "source_ids": []}
                plan["rounds"].append(existing)
            existing["source_ids"].append(span.id)
            notices.append(f"Fallback mapped {span.id} to its round.")
        else:
            section_type, title = _section_for(span)
            plan["document_sections"].append({"source_id": span.id, "type": section_type, "title": title})
            notices.append(f"Fallback mapped {span.id} to {section_type}.")
        claimed.add(span.id)
    return notices


def build_result(filename: str, pages: int, raw_text: str, spans: list[SourceSpan], plan: dict[str, Any]) -> dict[str, Any]:
    notices = repair_plan(spans, plan)
    span_map = {span.id: span for span in spans}
    used = [source_id for item in plan["rounds"] for source_id in item["source_ids"]] + [item["source_id"] for item in plan["document_sections"]]
    if len(used) != len(spans) or set(used) != set(span_map):
        raise ValueError("Source span coverage invariant failed.")

    extracted = _allowed_properties(SCHEMA["$defs"]["experience"], plan.get("experience", {}))
    experience = _merge(_default(SCHEMA["$defs"]["experience"]), extracted)
    experience["id"] = _experience_id()
    experience["source"]["experience_number"] = int(experience["id"].split("_")[-1])
    experience["raw_text"] = raw_text
    experience["rounds"] = [_normalize_round(item, index, span_map) for index, item in enumerate(plan["rounds"], 1) if item["source_ids"]]
    experience["quality"] = {"completeness": "high", "confidence": "medium", "issues": ["AI-extracted fields require review before canonical import.", *notices]}

    sections: list[dict[str, Any]] = []
    for item in plan["document_sections"]:
        span = span_map[item["source_id"]]
        sections.append({"type": item["type"], "title": item.get("title") or span.heading, "source_ids": [span.id], "raw_content": span.text})
    for index, (round_data, round_plan) in enumerate(zip(experience["rounds"], [item for item in plan["rounds"] if item["source_ids"]], strict=True), 1):
        sections.append({"type": "round", "title": round_data["name"], "source_ids": round_plan["source_ids"], "raw_content": round_data["raw_content"]})
    sections.sort(key=lambda item: min(next(i for i, span in enumerate(spans) if span.id == source_id) for source_id in item["source_ids"]))
    for index, section in enumerate(sections, 1): section.update({"id": f"section-{index:02d}", "order": index})
    if "".join(section["raw_content"] for section in sections) != raw_text:
        raise ValueError("Lossless UI reconstruction invariant failed.")
    return {"dataset_metadata": {"dataset_name": "0xTrace Interview Experiences", "schema_version": "1.3", "source_type": "pdf_upload", "total_experiences": 1, "total_rounds": len(experience["rounds"])}, "experiences": [experience], "ui_document": {"version": "1.0", "source": {"filename": filename, "page_count": pages, "character_count": len(raw_text), "sha256": hashlib.sha256(raw_text.encode()).hexdigest()}, "sections": sections, "integrity": {"lossless": True, "source_span_count": len(spans), "assigned_source_span_count": len(used), "recovery_notices": notices}}}


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
        pages = len(__import__("pypdf").PdfReader(BytesIO(content)).pages)
        spans = make_source_spans(raw_text)
        return build_result(filename, pages, raw_text, spans, await ask_agent(spans, settings.groq_api_key))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Extraction pipeline failed: {exc}") from exc
