"""Production entrypoint for lossless LLM section mapping.

Known visual headings become block boundaries locally; all other layouts fall
back to paragraphs. The LLM only labels these source blocks.
"""

from __future__ import annotations

from io import BytesIO
import re

from fastapi import FastAPI, File, HTTPException, UploadFile

from .config import get_settings
from .semantic_viewer import (
    RawSection, SemanticPdfResponse, SourceBlock, _layout_text, classify_blocks, viewer,
)

app = FastAPI(title="0xTrace lossless experience parser", version="1.1.0")
BOUNDARY = re.compile(r"(?im)^\s*(?:round\s+\d+\s*:|insights\s*:|contact\s*:|linkedin\s*:|all\s+the\s+best\s*!*)")


def split_source_blocks(raw_text: str) -> list[SourceBlock]:
    matches = list(BOUNDARY.finditer(raw_text))
    if not matches:
        chunks = re.findall(r".*?(?:\n\s*\n+|\Z)", raw_text, flags=re.S)
        return [SourceBlock(id=f"b{number:03d}", raw_text=chunk) for number, chunk in enumerate((chunk for chunk in chunks if chunk), 1)]
    starts = [match.start() for match in matches] + [len(raw_text)]
    chunks = ([raw_text[:starts[0]]] if starts[0] else []) + [raw_text[match.start():starts[index + 1]] for index, match in enumerate(matches)]
    return [SourceBlock(id=f"b{number:03d}", raw_text=chunk) for number, chunk in enumerate(chunks, 1) if chunk]


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
    blocks = split_source_blocks(raw_text)
    mapped = {item.id: item for item in await classify_blocks(blocks, settings.groq_api_key)}
    sections = [RawSection(id=block.id, section=mapped[block.id].section, title=mapped[block.id].title, raw_text=block.raw_text) for block in blocks]
    if "".join(section.raw_text for section in sections) != raw_text:
        raise HTTPException(status_code=500, detail="Lossless mapping invariant failed.")
    return SemanticPdfResponse(filename=filename, page_count=pages, extraction_method="poppler_layout", raw_text=raw_text, sections=sections)


@app.get("/")
async def root():
    return await viewer()
