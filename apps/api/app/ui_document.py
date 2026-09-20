"""High-quality UI document extraction.

The LLM returns labels and structure only. Every visible ``text`` value is
copied from a source block produced by Poppler, so the document remains
lossless while becoming straightforward to render in a UI.
"""

from __future__ import annotations

import json
from collections import OrderedDict

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, ConfigDict, Field

from .config import get_settings
from .semantic_viewer import SourceBlock, _layout_text, _reference_examples
from .semantic_viewer_v2 import split_source_blocks

app = FastAPI(title="0xTrace UI document parser", version="2.0.0")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class UiBlock(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    order: int
    element_type: str
    text: str


class UiSection(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    order: int
    type: str
    title: str
    blocks: list[UiBlock]


class UiDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: str = "0xtrace.ui-document.v1"
    source: dict[str, object]
    metadata: dict[str, object] = Field(default_factory=dict)
    sections: list[UiSection]
    raw_text: str


def _fallback_labels(blocks: list[SourceBlock]) -> dict[str, dict[str, str]]:
    return {block.id: {"section": "other", "title": "Document", "type": "other", "element_type": "paragraph"} for block in blocks}


async def _label_blocks(blocks: list[SourceBlock], key: str) -> dict[str, dict[str, str]]:
    settings = get_settings()
    model = settings.groq_model if settings.groq_model and "llama-3.3" not in settings.groq_model else "openai/gpt-oss-120b"
    payload = {
        "task": "Create UI labels for source blocks from an interview experience.",
        "rules": [
            "Return only JSON: {blocks:[{id,section_id,section_title,section_type,element_type}]}",
            "Return each id exactly once; do not return or rewrite source text.",
            "section_type must be one of metadata, eligibility, compensation, pre_placement, round, outcome, insights, contact, conclusion, other.",
            "element_type must be one of heading, paragraph, list, question, coding_problem, table, note.",
            "Use the source's own round names in section_title. Group contiguous blocks belonging to the same section with the same section_id.",
            "Preserve source order."
        ],
        "examples_from_ExperiencePDFs": _reference_examples(),
        "blocks": [block.model_dump() for block in blocks],
    }
    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(GROQ_URL, headers={"Authorization": f"Bearer {key}"}, json={
            "model": model, "temperature": 0, "response_format": {"type": "json_object"},
            "messages": [{"role": "system", "content": "You classify document blocks precisely."}, {"role": "user", "content": json.dumps(payload, ensure_ascii=False)}],
        })
    if response.is_error:
        raise HTTPException(status_code=502, detail=f"LLM UI extraction failed: {response.text[:300]}")
    try:
        result = response.json()["choices"][0]["message"]["content"]
        rows = json.loads(result)["blocks"]
        labels = {row["id"]: {"section": row["section_id"], "title": row["section_title"], "type": row["section_type"], "element_type": row["element_type"]} for row in rows}
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="LLM returned invalid UI structure.") from exc
    if set(labels) != {block.id for block in blocks}:
        raise HTTPException(status_code=502, detail="LLM did not label every source block exactly once.")
    return labels


def build_ui_document(filename: str, pages: int, raw_text: str, blocks: list[SourceBlock], labels: dict[str, dict[str, str]]) -> UiDocument:
    grouped: OrderedDict[str, UiSection] = OrderedDict()
    for order, block in enumerate(blocks, 1):
        label = labels[block.id]
        section_id = label["section"]
        if section_id not in grouped:
            grouped[section_id] = UiSection(id=section_id, order=len(grouped) + 1, type=label["type"], title=label["title"], blocks=[])
        grouped[section_id].blocks.append(UiBlock(id=block.id, order=order, element_type=label["element_type"], text=block.raw_text))
    sections = list(grouped.values())
    if sum(len(block.text) for section in sections for block in section.blocks) != len(raw_text):
        raise ValueError("UI block text does not cover the source text.")
    return UiDocument(source={"filename": filename, "page_count": pages, "extraction_method": "poppler_layout", "character_count": len(raw_text)}, sections=sections, raw_text=raw_text)


@app.post("/api/v1/experiences/parse-ui", response_model=UiDocument)
async def parse_ui(file: UploadFile = File(...)) -> UiDocument:
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
        blocks = split_source_blocks(raw_text)
        labels = await _label_blocks(blocks, settings.groq_api_key)
        return build_ui_document(filename, pages, raw_text, blocks, labels)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not build UI document: {exc}") from exc
