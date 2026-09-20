"""PDF text extraction with an optional OCR fallback for scanned files."""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
import shutil
import subprocess
import tempfile

from pypdf import PdfReader


class PdfExtractionError(ValueError):
    pass


@dataclass(frozen=True)
class ExtractedPdf:
    text: str
    page_count: int
    method: str


def _clean(text: str) -> str:
    return "\n".join(line.rstrip() for line in text.replace("\x00", "").splitlines()).strip()


def extract_pdf_text(content: bytes) -> ExtractedPdf:
    try:
        reader = PdfReader(BytesIO(content))
        if reader.is_encrypted:
            raise PdfExtractionError("Password-protected PDFs are not supported.")
        page_count = len(reader.pages)
        native_text = _clean("\n\n".join(page.extract_text() or "" for page in reader.pages))
    except PdfExtractionError:
        raise
    except Exception as exc:
        raise PdfExtractionError("The uploaded file is not a readable PDF.") from exc

    if len(native_text) >= 80:
        return ExtractedPdf(text=native_text, page_count=page_count, method="native")
    ocr_text = _ocr(content)
    if len(ocr_text) >= 20:
        return ExtractedPdf(text=ocr_text, page_count=page_count, method="ocr")
    raise PdfExtractionError("No readable text was found. Upload a text-based PDF, or install Tesseract for scanned PDFs.")


def _ocr(content: bytes) -> str:
    """OCR is optional: normal text-based PDFs do not need extra system packages."""
    if not shutil.which("pdftoppm") or not shutil.which("tesseract"):
        return ""
    try:
        with tempfile.TemporaryDirectory(prefix="0xtrace-pdf-") as directory:
            source = f"{directory}/source.pdf"
            with open(source, "wb") as handle:
                handle.write(content)
            rendered = subprocess.run(["pdftoppm", "-r", "200", "-png", source, f"{directory}/page"], capture_output=True, text=True, timeout=90, check=False)
            if rendered.returncode:
                return ""
            text: list[str] = []
            for page in sorted(Path(directory).glob("page-*.png")):
                result = subprocess.run(["tesseract", str(page), "stdout", "--dpi", "200"], capture_output=True, text=True, timeout=45, check=False)
                if result.returncode == 0:
                    text.append(result.stdout)
            return _clean("\n\n".join(text))
    except (OSError, subprocess.TimeoutExpired):
        return ""
