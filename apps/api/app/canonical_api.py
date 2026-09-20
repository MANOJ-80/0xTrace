"""Canonical V1.3 interview-experience extraction API."""

from __future__ import annotations

import json
import os
from copy import deepcopy
from io import BytesIO
from pathlib import Path
import re

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel

from .config import get_settings
from .semantic_viewer import _layout_text

app = FastAPI(title="0xTrace canonical V1.3 parser", version="1.0.0")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
ROOT = Path(__file__).resolve().parents[3]
SCHEMA = json.loads((ROOT / "data/schema/schema.json").read_text())


class CanonicalResponse(BaseModel):
    dataset_metadata: dict
    experiences: list[dict]


def _schema_node(ref: str | None = None, node: dict | None = None) -> dict:
    if ref:
        return SCHEMA["$defs"][ref.rsplit("/", 1)[-1]]
    return node or {}


def _default(node: dict) -> object:
    node = _schema_node(node=node)
    if "$ref" in node:
        node = _schema_node(node["$ref"])
    if node.get("type") == "object":
        return {key: _default(value) for key, value in node.get("properties", {}).items()}
    if node.get("type") == "array":
        return []
    types = node.get("type", [])
    if isinstance(types, str):
        types = [types]
    if "string" in types:
        enum = node.get("enum", [])
        return "unknown" if "unknown" in enum else (enum[0] if enum else None)
    if "integer" in types:
        return None
    if "boolean" in types:
        return False
    return None


def _allowed_properties(node: dict, value: object) -> object:
    if "$ref" in node:
        node = _schema_node(node["$ref"])
    if isinstance(value, dict) and node.get("type") == "object":
        return {key: _allowed_properties(node.get("properties", {}).get(key, {}), child) for key, child in value.items() if key in node.get("properties", {})}
    if isinstance(value, list) and node.get("type") == "array":
        return [_allowed_properties(node.get("items", {}), child) for child in value]
    return value


def _merge(base: object, incoming: object) -> object:
    if isinstance(base, dict) and isinstance(incoming, dict):
        result = deepcopy(base)
        for key, value in incoming.items():
            result[key] = _merge(result.get(key), value)
        return result
    return incoming


def _experience_id() -> str:
    try:
        dataset = json.loads((ROOT / "data/canonical/interview_experiences_v1.3.json").read_text())
        return f"exp_{len(dataset.get('experiences', [])) + 1:03d}"
    except (OSError, ValueError):
        return "exp_127"


def _clean_json(content: str) -> dict:
    content = content.strip()
    content = re.sub(r"^```(?:json)?\s*|\s*```$", "", content, flags=re.I)
    result = json.loads(content)
    if not isinstance(result, dict):
        raise ValueError("Expected one JSON experience object")
    return result


async def _extract_experience(raw_text: str, key: str) -> dict:
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    experience_schema = SCHEMA["$defs"]["experience"]
    prompt = {
        "task": "Extract one interview experience into the supplied canonical V1.3 experience schema.",
        "rules": [
            "Return only one JSON object matching the experience schema.",
            "Never invent or summarize. Use null, empty arrays, or unknown when the PDF does not state a value.",
            "Preserve every reported question and coding problem in full.",
            "Each round.raw_content must contain the complete original content for that round.",
            "Use controlled enum values from the schema exactly."
        ],
        "experience_schema": experience_schema,
        "pdf_text": raw_text,
    }
    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(GROQ_URL, headers={"Authorization": f"Bearer {key}"}, json={
            "model": model, "temperature": 0, "response_format": {"type": "json_object"},
            "messages": [{"role": "system", "content": "You are a meticulous canonical dataset extractor."}, {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)}],
        })
    if response.is_error:
        raise HTTPException(status_code=502, detail=f"Canonical extraction failed: {response.text[:400]}")
    try:
        return _clean_json(response.json()["choices"][0]["message"]["content"])
    except (KeyError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="LLM returned invalid canonical JSON.") from exc


@app.post("/api/v1/experiences/parse-canonical", response_model=CanonicalResponse)
async def parse_canonical(file: UploadFile = File(...)) -> CanonicalResponse:
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
        extracted = await _extract_experience(raw_text, settings.groq_api_key)
        clean = _allowed_properties(SCHEMA["$defs"]["experience"], extracted)
        experience = _merge(_default(SCHEMA["$defs"]["experience"]), clean)
        experience["id"] = _experience_id()
        experience["source"]["experience_number"] = int(experience["id"].split("_")[-1])
        experience["raw_text"] = raw_text
        if not experience.get("quality", {}).get("issues"):
            experience["quality"]["issues"] = ["LLM extraction requires human review before canonical import."]
        dataset = {
            "dataset_metadata": {
                "dataset_name": "0xTrace Interview Experiences",
                "schema_version": "1.3",
                "source_type": "pdf_upload",
                "total_experiences": 1,
                "total_rounds": len(experience.get("rounds", [])),
            },
            "experiences": [experience],
        }
        return CanonicalResponse.model_validate(dataset)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not build canonical V1.3 JSON: {exc}") from exc
