"""Final production entrypoint: evidence-first canonical + UI extraction."""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile

from .agent_pipeline import SourceSpan, ask_agent, make_source_spans
from .agent_pipeline_v2 import build_result as _build_result, extract as _unused_extract, repair_plan as _repair_plan
from .config import get_settings
from .semantic_viewer import _layout_text

app = FastAPI(title="0xTrace extraction agent", version="3.0.0")


def _infer_round_type(round_plan: dict[str, Any]) -> None:
    if round_plan.get("type") not in {None, "", "unknown"}:
        return
    label = f"{round_plan.get('name', '')} {round_plan.get('original_name', '')}".lower()
    if "hr" in label or "human resource" in label:
        round_plan["type"] = "hr_interview"
    elif "managerial" in label or "manager" in label:
        round_plan["type"] = "managerial_interview"
    elif "technical" in label:
        round_plan["type"] = "technical_interview"
    elif "online" in label or "assessment" in label or "test" in label:
        round_plan["type"] = "online_assessment"
    elif "group discussion" in label:
        round_plan["type"] = "group_discussion"
    elif "coding" in label:
        round_plan["type"] = "coding_test"
    else:
        round_plan["type"] = "unknown"


def build_result(filename: str, pages: int, raw_text: str, spans: list[SourceSpan], plan: dict[str, Any]) -> dict[str, Any]:
    # The leading pre-round block is always metadata, never generic additional information.
    plan.setdefault("document_sections", [])
    for span in spans:
        if span.kind == "document" and not any(item.get("source_id") == span.id for item in plan["document_sections"]):
            plan["document_sections"].append({"source_id": span.id, "type": "metadata", "title": "Interview overview"})
    for round_plan in plan.setdefault("rounds", []):
        _infer_round_type(round_plan)
    result = _build_result(filename, pages, raw_text, spans, plan)
    # Fallback-created rounds have no opportunity to pass through the pre-plan inference.
    for round_data in result["experiences"][0]["rounds"]:
        _infer_round_type(round_data)
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
        spans = make_source_spans(raw_text)
        return build_result(filename, pages, raw_text, spans, await ask_agent(spans, settings.groq_api_key))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Extraction pipeline failed: {exc}") from exc
