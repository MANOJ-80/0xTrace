"""Validated canonical V1.3 endpoint with required nested-round normalization."""

from __future__ import annotations

from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile

from .canonical_api import (
    CanonicalResponse, ROOT, SCHEMA, _allowed_properties, _default, _experience_id,
    _extract_experience, _layout_text, _merge, get_settings,
)

app = FastAPI(title="0xTrace canonical V1.3 parser", version="1.1.0")


def normalize_experience(candidate: dict, raw_text: str) -> dict:
    experience = _merge(_default(SCHEMA["$defs"]["experience"]), _allowed_properties(SCHEMA["$defs"]["experience"], candidate))
    normalized_rounds: list[dict] = []
    for round_data in experience.get("rounds", []):
        normalized = _merge(_default(SCHEMA["$defs"]["round"]), round_data)
        if not normalized.get("raw_content"):
            normalized["raw_content"] = normalized.get("description") or ""
        if normalized.get("coding", {}).get("problem_count") is None:
            normalized["coding"]["problem_count"] = len(normalized.get("coding", {}).get("problems", []))
        normalized_rounds.append(normalized)
    experience["rounds"] = normalized_rounds
    experience["id"] = _experience_id()
    experience["source"]["experience_number"] = int(experience["id"].split("_")[-1])
    experience["raw_text"] = raw_text
    experience["quality"]["issues"] = list(experience.get("quality", {}).get("issues", []))
    if "LLM extraction requires human review before canonical import." not in experience["quality"]["issues"]:
        experience["quality"]["issues"].append("LLM extraction requires human review before canonical import.")
    return experience


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
        experience = normalize_experience(await _extract_experience(raw_text, settings.groq_api_key), raw_text)
        return CanonicalResponse(dataset_metadata={"dataset_name": "0xTrace Interview Experiences", "schema_version": "1.3", "source_type": "pdf_upload", "total_experiences": 1, "total_rounds": len(experience["rounds"])}, experiences=[experience])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not build canonical V1.3 JSON: {exc}") from exc
