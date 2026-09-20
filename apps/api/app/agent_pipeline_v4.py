"""UI polish layer for the evidence-first extraction agent.

Preserves source headings in ``original_name`` while ensuring the rendered
timeline has unique ordered names even when a PDF repeats a round number.
"""

from __future__ import annotations

import re
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile

from .agent_pipeline import SourceSpan, ask_agent, make_source_spans
from .agent_pipeline_v3 import build_result as _build_result
from .config import get_settings
from .semantic_viewer import _layout_text

app = FastAPI(title="0xTrace extraction agent", version="4.0.0")


def _title_from_original(round_data: dict[str, Any]) -> str:
    source = round_data.get("original_name") or round_data.get("name") or ""
    source = re.sub(r"(?i)^round\s*\d+\s*[:.-]?\s*", "", source).strip(" -:()")
    source = re.sub(r"\s*\[[^]]+\]", "", source).strip()
    return source or "Interview"


def polish_document(result: dict[str, Any]) -> dict[str, Any]:
    experience = result["experiences"][0]
    for sequence, round_data in enumerate(experience["rounds"], 1):
        round_data["sequence"] = sequence
        round_data["original_name"] = round_data.get("original_name") or round_data["name"]
        round_data["name"] = f"Round {sequence} - {_title_from_original(round_data)}"
    rounds = {f"round-{round_data['sequence']:02d}": round_data for round_data in experience["rounds"]}
    for section in result["ui_document"]["sections"]:
        if section["type"] == "round":
            matching = next((round_data for round_data in experience["rounds"] if round_data["raw_content"] == section["raw_content"]), None)
            if matching:
                section["title"] = matching["name"]
        heading = section["raw_content"].lstrip().lower()
        if heading.startswith("result") or heading.startswith("verdict"):
            section.update(type="outcome", title="Outcome")
        elif heading.startswith("conclusion") or heading.startswith("all the best"):
            section.update(type="conclusion", title="Conclusion")
        elif heading.startswith("linkedin") or heading.startswith("contact"):
            section.update(type="contacts", title="Contact")
        elif heading.startswith("tips") or heading.startswith("insights"):
            section.update(type="tips", title="Tips & insights")
    return result


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
        pages = len(__import__("pypdf").PdfReader(__import__("io").BytesIO(content)).pages)
        result = _build_result(filename, pages, raw_text, make_source_spans(raw_text), await ask_agent(make_source_spans(raw_text), settings.groq_api_key))
        return polish_document(result)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Extraction pipeline failed: {exc}") from exc
