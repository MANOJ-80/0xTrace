"""Groq JSON-mode client. The API key is read only from the environment."""

from __future__ import annotations

import json
import httpx

from .models import ExperienceDraft

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
SYSTEM_PROMPT = """You extract interview experiences from PDFs into a reviewable JSON draft. Return ONLY valid JSON matching the schema. Never invent facts. Use null for a single unknown field, [] for an unknown list, and {} for an unknown object. Preserve all reported questions and coding problems. rounds.type must be one of: coding_test, technical_interview, hr_interview, managerial_interview, group_discussion, aptitude_test, unknown. employment_type must be one of: full_time, internship, internship_plus_fte, contract, part_time, unknown. Use dates exactly as written where possible. Capture uncertainty in extraction_notes."""


async def extract_experience(text: str, api_key: str, model: str) -> ExperienceDraft:
    payload = {
        "model": model,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "Extract this interview experience. JSON schema:\n" + json.dumps(ExperienceDraft.model_json_schema(), separators=(",", ":")) + "\n\nPDF text:\n" + text[:110_000]},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=75) as client:
            response = await client.post(GROQ_URL, headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        return ExperienceDraft.model_validate_json(response.json()["choices"][0]["message"]["content"])
    except httpx.HTTPStatusError as exc:
        message = exc.response.json().get("error", {}).get("message", "Groq request failed")
        raise RuntimeError(f"Groq extraction failed: {message}") from exc
    except (KeyError, ValueError) as exc:
        raise RuntimeError("Groq returned an invalid structured response.") from exc
