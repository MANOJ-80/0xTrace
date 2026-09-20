from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .groq import extract_experience
from .models import ParseResponse
from .pdf_text import PdfExtractionError, extract_pdf_text

app = FastAPI(title="0xTrace PDF Parser", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["POST", "GET"], allow_headers=["*"])


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/experiences/parse", response_model=ParseResponse)
async def parse_experience_pdf(file: UploadFile = File(...)) -> ParseResponse:
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
    if not settings.groq_api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="GROQ_API_KEY is not configured on the server.")
    try:
        experience = await extract_experience(extracted.text, settings.groq_api_key, settings.groq_model)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return ParseResponse(filename=filename, page_count=extracted.page_count, text_characters=len(extracted.text), extraction_method=extracted.method, experience=experience)
