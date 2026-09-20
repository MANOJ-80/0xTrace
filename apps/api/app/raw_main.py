"""Lossless PDF text viewer: no LLM calls and no summarization."""

from __future__ import annotations

import re

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, ConfigDict

from .config import get_settings
from .pdf_text import PdfExtractionError, extract_pdf_text

app = FastAPI(title="0xTrace Raw PDF Viewer", version="0.2.0")


class RawSection(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    kind: str
    heading: str
    raw_text: str


class RawParseResponse(BaseModel):
    filename: str
    page_count: int
    text_characters: int
    extraction_method: str
    raw_text: str
    sections: list[RawSection]


HEADINGS = re.compile(r"(?im)^(?:round\s+\d+\s*:[^\n]*|insights\s*:|contact\s*:|linkedin\s*:|all the best\s*!*)")
ROUND = re.compile(r"(?i)^round\s+\d+\s*:")


def section_raw_text(text: str) -> list[RawSection]:
    """Only split at a detected heading. Concatenating results exactly reproduces text."""
    matches = list(HEADINGS.finditer(text))
    if not matches:
        return [RawSection(id="document", kind="document", heading="Document", raw_text=text)]

    sections: list[RawSection] = []
    starts = [match.start() for match in matches] + [len(text)]
    if starts[0]:
        sections.append(RawSection(id="00-document", kind="document", heading="Document details", raw_text=text[:starts[0]]))
    for index, match in enumerate(matches):
        heading = match.group(0).strip()
        kind = "round" if ROUND.match(heading) else {
            "insights": "insights", "contact": "contact", "linkedin": "contact", "all the best": "conclusion"
        }.get(heading.lower().rstrip(":"), "other")
        slug = re.sub(r"[^a-z0-9]+", "-", heading.lower()).strip("-")
        sections.append(RawSection(id=f"{index + 1:02d}-{slug}", kind=kind, heading=heading, raw_text=text[match.start():starts[index + 1]]))
    return sections


async def _read_pdf(file: UploadFile) -> tuple[str, int, str]:
    settings = get_settings()
    filename = file.filename or "upload.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Only PDF uploads are supported.")
    content = await file.read(settings.max_pdf_bytes + 1)
    if len(content) > settings.max_pdf_bytes:
        raise HTTPException(status_code=413, detail="PDF exceeds the configured upload limit.")
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="The uploaded file does not have a valid PDF signature.")
    try:
        extracted = extract_pdf_text(content)
    except PdfExtractionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return filename, extracted.page_count, extracted.method, extracted.text


@app.post("/api/v1/experiences/parse", response_model=RawParseResponse)
async def parse_raw_pdf(file: UploadFile = File(...)) -> RawParseResponse:
    filename, pages, method, text = await _read_pdf(file)
    sections = section_raw_text(text)
    if "".join(section.raw_text for section in sections) != text:
        raise HTTPException(status_code=500, detail="Lossless section mapping invariant failed.")
    return RawParseResponse(filename=filename, page_count=pages, text_characters=len(text), extraction_method=method, raw_text=text, sections=sections)


@app.get("/", response_class=HTMLResponse)
async def viewer() -> str:
    return '''<!doctype html><html><head><meta charset="utf-8"><title>0xTrace PDF Viewer</title><style>
body{font:16px system-ui;max-width:1050px;margin:36px auto;background:#101114;color:#e8e8e8;padding:0 20px}input,button{font:inherit;padding:10px}button{background:#dcff61;border:0;border-radius:7px;margin-left:8px}#meta{color:#abb3bc;margin:20px 0}.section{border:1px solid #30343a;border-radius:10px;margin:14px 0;overflow:hidden}h2{font-size:15px;background:#191c21;margin:0;padding:12px 16px;color:#dcff61}pre{white-space:pre-wrap;word-break:break-word;margin:0;padding:18px;line-height:1.55;font:14px/1.55 ui-monospace,monospace}.hidden{display:none}</style></head><body>
<h1>0xTrace raw PDF viewer</h1><p>Every displayed character is extracted verbatim. No LLM, rewriting, or summarization.</p>
<form id="upload"><input id="file" type="file" accept="application/pdf" required><button>Extract raw text</button></form><div id="meta"></div><main id="sections"></main>
<script>const form=document.querySelector('#upload'),out=document.querySelector('#sections'),meta=document.querySelector('#meta');form.onsubmit=async e=>{e.preventDefault();out.innerHTML='';meta.textContent='Extracting…';const fd=new FormData();fd.append('file',document.querySelector('#file').files[0]);const r=await fetch('/api/v1/experiences/parse',{method:'POST',body:fd});const d=await r.json();if(!r.ok){meta.textContent=d.detail||'Extraction failed';return}meta.textContent=`${d.filename} · ${d.page_count} pages · ${d.text_characters} extracted characters · ${d.extraction_method}`;d.sections.forEach(s=>{const a=document.createElement('article');a.className='section';const h=document.createElement('h2');h.textContent=s.heading;const p=document.createElement('pre');p.textContent=s.raw_text;a.append(h,p);out.append(a)})}</script></body></html>'''
