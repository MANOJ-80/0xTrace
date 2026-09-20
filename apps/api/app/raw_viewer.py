"""No-LLM, lossless PDF text section viewer.

The response includes every extracted character in ``raw_text``. A section is
only a contiguous slice of that exact value, never an AI summary or rewrite.
"""

from __future__ import annotations

import re

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, ConfigDict

from .config import get_settings
from .pdf_text import PdfExtractionError, extract_pdf_text

app = FastAPI(title="0xTrace Raw PDF Viewer", version="1.0.0")


class RawSection(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    kind: str
    heading: str
    raw_text: str


class RawPdfResponse(BaseModel):
    filename: str
    page_count: int
    text_characters: int
    extraction_method: str
    raw_text: str
    sections: list[RawSection]


# Deliberately no line anchor: PDFs often encode visual lines as one text stream.
HEADING = re.compile(r"(?i)(?:round\s+\d+\s*:|insights\s*:|contact\s*:|linkedin\s*:|all\s+the\s+best\s*!*)")


def map_sections_losslessly(raw_text: str) -> list[RawSection]:
    matches = list(HEADING.finditer(raw_text))
    if not matches:
        return [RawSection(id="00-document", kind="document", heading="Document", raw_text=raw_text)]
    starts = [match.start() for match in matches] + [len(raw_text)]
    sections: list[RawSection] = []
    if starts[0]:
        sections.append(RawSection(id="00-document", kind="document", heading="Document details", raw_text=raw_text[:starts[0]]))
    for index, match in enumerate(matches):
        heading = re.sub(r"\s+", " ", match.group(0)).strip()
        normalized = heading.lower().rstrip(":!").strip()
        kind = "round" if normalized.startswith("round ") else {
            "insights": "insights", "contact": "contact", "linkedin": "contact", "all the best": "conclusion"
        }.get(normalized, "other")
        sections.append(RawSection(id=f"{index + 1:02d}-{kind}", kind=kind, heading=heading, raw_text=raw_text[match.start():starts[index + 1]]))
    assert "".join(section.raw_text for section in sections) == raw_text
    return sections


@app.post("/api/v1/experiences/parse", response_model=RawPdfResponse)
async def parse_pdf(file: UploadFile = File(...)) -> RawPdfResponse:
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
    return RawPdfResponse(filename=filename, page_count=extracted.page_count, text_characters=len(extracted.text), extraction_method=extracted.method, raw_text=extracted.text, sections=map_sections_losslessly(extracted.text))


@app.get("/", response_class=HTMLResponse)
async def viewer() -> str:
    return '''<!doctype html><html><head><meta charset="utf-8"><title>0xTrace raw viewer</title><style>body{background:#101114;color:#eceff1;font:16px system-ui;max-width:1050px;margin:32px auto;padding:0 20px}input,button{font:inherit;padding:10px}button{background:#ddff67;border:0;border-radius:6px;margin-left:8px}#meta{margin:18px 0;color:#abb3bc}.section{border:1px solid #30343a;border-radius:9px;margin:14px 0;overflow:hidden}h2{font-size:14px;margin:0;padding:12px 16px;background:#1b1e23;color:#ddff67}pre{white-space:pre-wrap;word-break:break-word;margin:0;padding:16px;font:14px/1.55 ui-monospace,monospace}</style></head><body><h1>0xTrace raw PDF viewer</h1><p>All displayed text is verbatim extracted text. No AI, summary, or rewrite.</p><form id="f"><input type="file" accept="application/pdf" required><button>Extract</button></form><div id="meta"></div><main></main><script>const f=document.querySelector('form'),m=document.querySelector('#meta'),o=document.querySelector('main');f.onsubmit=async e=>{e.preventDefault();o.innerHTML='';m.textContent='Extracting…';const x=new FormData();x.append('file',f.querySelector('input').files[0]);const r=await fetch('/api/v1/experiences/parse',{method:'POST',body:x}),d=await r.json();if(!r.ok){m.textContent=d.detail;return}m.textContent=`${d.filename} · ${d.page_count} pages · ${d.text_characters} characters`;d.sections.forEach(s=>{const a=document.createElement('article'),h=document.createElement('h2'),p=document.createElement('pre');a.className='section';h.textContent=s.heading;p.textContent=s.raw_text;a.append(h,p);o.append(a)})}</script></body></html>'''
