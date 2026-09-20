"""LLM-assisted, lossless PDF section mapper.

The model classifies block IDs only. It never supplies text that is rendered in
the UI, so every displayed character comes from the original PDF extraction.
"""

from __future__ import annotations

import json
import os
from io import BytesIO
from pathlib import Path
import re
import subprocess
import tempfile

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, ConfigDict, Field

from .config import get_settings
from .pdf_text import PdfExtractionError, extract_pdf_text

app = FastAPI(title="0xTrace semantic raw PDF viewer", version="1.0.0")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class SourceBlock(BaseModel):
    id: str
    raw_text: str


class BlockMap(BaseModel):
    id: str
    section: str
    title: str


class RawSection(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    section: str
    title: str
    raw_text: str


class SemanticPdfResponse(BaseModel):
    filename: str
    page_count: int
    extraction_method: str
    raw_text: str
    sections: list[RawSection]


def _layout_text(content: bytes) -> str:
    """Prefer Poppler layout text; fall back to the existing local PDF extractor."""
    try:
        with tempfile.TemporaryDirectory(prefix="0xtrace-layout-") as directory:
            source, output = Path(directory) / "source.pdf", Path(directory) / "text.txt"
            source.write_bytes(content)
            result = subprocess.run(["pdftotext", "-layout", str(source), str(output)], capture_output=True, timeout=45, check=False)
            if result.returncode == 0 and output.exists():
                text = output.read_text("utf-8", errors="replace")
                if len(text.strip()) >= 80:
                    return text
    except (OSError, subprocess.TimeoutExpired):
        pass
    return extract_pdf_text(content).text


def split_blocks(raw_text: str) -> list[SourceBlock]:
    """Paragraph-like chunks with delimiters retained so joining is exactly lossless."""
    chunks = re.findall(r".*?(?:\n\s*\n+|\Z)", raw_text, flags=re.S)
    blocks = [chunk for chunk in chunks if chunk]
    return [SourceBlock(id=f"b{index:03d}", raw_text=block) for index, block in enumerate(blocks, 1)]


def _reference_examples() -> str:
    """Small few-shot corpus from supplied PDFs; configurable to control token cost."""
    root = Path(__file__).resolve().parents[3] / "ExperiencePDFs"
    limit = int(os.getenv("EXAMPLE_CONTEXT_CHARS", "4500"))
    pieces: list[str] = []
    used = 0
    for path in sorted(root.glob("*.pdf"))[:3]:
        try:
            sample = _layout_text(path.read_bytes())[:1500]
        except (OSError, PdfExtractionError):
            continue
        remaining = limit - used
        if remaining <= 0:
            break
        pieces.append(f"--- {path.name} ---\n{sample[:remaining]}")
        used += len(sample)
    return "\n\n".join(pieces)


async def classify_blocks(blocks: list[SourceBlock], api_key: str) -> list[BlockMap]:
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    prompt = {
        "task": "Label each source block for an interview-experience UI.",
        "rules": [
            "Return JSON only: {blocks:[{id,section,title}]}",
            "Return every input id exactly once.",
            "Never copy, paraphrase, summarize, or edit source text.",
            "Use section values such as metadata, eligibility, compensation, pre_placement, round, outcome, insights, contact, conclusion, or other.",
            "A title is a short UI label only; source text is rendered separately and remains verbatim."
        ],
        "reference_examples_from_experiencepdfs": _reference_examples(),
        "source_blocks": [block.model_dump() for block in blocks],
    }
    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(GROQ_URL, headers={"Authorization": f"Bearer {api_key}"}, json={
            "model": model, "temperature": 0, "response_format": {"type": "json_object"},
            "messages": [{"role": "system", "content": "You are a precise document section classifier."}, {"role": "user", "content": json.dumps(prompt)}],
        })
    if response.is_error:
        raise HTTPException(status_code=502, detail=f"LLM mapping failed: {response.text[:300]}")
    try:
        mapped = [BlockMap.model_validate(item) for item in json.loads(response.json()["choices"][0]["message"]["content"])["blocks"]]
    except (KeyError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="LLM returned an invalid block map.") from exc
    expected = [block.id for block in blocks]
    if sorted(item.id for item in mapped) != sorted(expected) or len(mapped) != len(expected):
        raise HTTPException(status_code=502, detail="LLM did not map every source block exactly once.")
    return mapped


@app.post("/api/v1/experiences/parse", response_model=SemanticPdfResponse)
async def parse_pdf(file: UploadFile = File(...)) -> SemanticPdfResponse:
    settings = get_settings()
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is required for semantic section mapping.")
    filename = file.filename or "upload.pdf"
    content = await file.read(settings.max_pdf_bytes + 1)
    if not filename.lower().endswith(".pdf") or not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="Only valid PDF uploads are supported.")
    if len(content) > settings.max_pdf_bytes:
        raise HTTPException(status_code=413, detail="PDF exceeds the configured upload limit.")
    try:
        raw_text = _layout_text(content)
        pages = len(__import__("pypdf").PdfReader(BytesIO(content)).pages)
    except Exception as exc:
        raise HTTPException(status_code=422, detail="The uploaded PDF could not be read.") from exc
    blocks = split_blocks(raw_text)
    mapped = {item.id: item for item in await classify_blocks(blocks, settings.groq_api_key)}
    sections = [RawSection(id=block.id, section=mapped[block.id].section, title=mapped[block.id].title, raw_text=block.raw_text) for block in blocks]
    if "".join(section.raw_text for section in sections) != raw_text:
        raise HTTPException(status_code=500, detail="Lossless mapping invariant failed.")
    return SemanticPdfResponse(filename=filename, page_count=pages, extraction_method="poppler_layout", raw_text=raw_text, sections=sections)


@app.get("/", response_class=HTMLResponse)
async def viewer() -> str:
    return '''<!doctype html><html><head><meta charset="utf-8"><title>0xTrace experience parser</title><style>body{background:#101114;color:#eef0f2;font:16px system-ui;max-width:1050px;margin:32px auto;padding:0 20px}input,button{font:inherit;padding:10px}button{background:#ddff67;border:0;border-radius:6px;margin-left:8px}#meta{margin:18px 0;color:#abb3bc}.section{border:1px solid #30343a;border-radius:9px;margin:14px 0;overflow:hidden}h2{font-size:14px;margin:0;padding:12px 16px;background:#1b1e23;color:#ddff67}pre{white-space:pre-wrap;word-break:break-word;margin:0;padding:16px;font:14px/1.55 ui-monospace,monospace}</style></head><body><h1>0xTrace experience parser</h1><p>LLM classifies sections. The displayed content is verbatim PDF text.</p><form id="f"><input type="file" accept="application/pdf" required><button>Map sections</button></form><div id="meta"></div><main></main><script>const f=document.querySelector('form'),m=document.querySelector('#meta'),o=document.querySelector('main');f.onsubmit=async e=>{e.preventDefault();o.innerHTML='';m.textContent='Mapping sections…';const x=new FormData();x.append('file',f.querySelector('input').files[0]);const r=await fetch('/api/v1/experiences/parse',{method:'POST',body:x}),d=await r.json();if(!r.ok){m.textContent=d.detail;return}m.textContent=`${d.filename} · ${d.page_count} pages · ${d.sections.length} raw blocks`;d.sections.forEach(s=>{const a=document.createElement('article'),h=document.createElement('h2'),p=document.createElement('pre');a.className='section';h.textContent=`${s.title} · ${s.section}`;p.textContent=s.raw_text;a.append(h,p);o.append(a)})}</script></body></html>'''
