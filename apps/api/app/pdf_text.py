"""PDF text extraction with layout preservation.

The document parser downstream works on text lines, so the extractor must keep
line structure intact. Poppler's `pdftotext -layout` reconstructs lines, bullets,
and label/value columns far better than pypdf for design-tool exports. pypdf is
kept as a fallback for environments without poppler, and OCR handles scans.
"""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
import re
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


_ZERO_WIDTH = re.compile(r"[\u200b-\u200d\u2060\ufeff]")
_CONTROL = re.compile(r"[\x00-\x08\x0b\x0e-\x1f\x7f]")


def _normalise(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\x00", "")
    text = _ZERO_WIDTH.sub("", text)
    text = text.replace("\u00ad", "")
    text = text.replace("\u00a0", " ")
    text = text.replace("\f", "\n\n")
    text = _CONTROL.sub("", text)

    lines: list[str] = []
    blank = 0
    for raw_line in text.split("\n"):
        line = raw_line.rstrip()
        if line.strip():
            blank = 0
            lines.append(line)
        else:
            blank += 1
            if blank <= 2:
                lines.append("")
    return "\n".join(lines).strip()


def _pdftotext_layout(content: bytes) -> str:
    if not shutil.which("pdftotext"):
        return ""
    try:
        result = subprocess.run(
            ["pdftotext", "-layout", "-enc", "UTF-8", "-", "-"],
            input=content,
            capture_output=True,
            timeout=45,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    if result.returncode != 0:
        return ""
    return result.stdout.decode("utf-8", "replace")


def _pypdf_text(content: bytes) -> tuple[str, int]:
    try:
        reader = PdfReader(BytesIO(content))
        if reader.is_encrypted:
            raise PdfExtractionError("Password-protected PDFs are not supported.")
        page_count = len(reader.pages)
        text = "\n\n".join(page.extract_text() or "" for page in reader.pages)
    except PdfExtractionError:
        raise
    except Exception as exc:
        raise PdfExtractionError("The uploaded file is not a readable PDF.") from exc
    return text, page_count


def _page_count(content: bytes, text: str) -> int:
    try:
        return len(PdfReader(BytesIO(content)).pages)
    except Exception:
        return max(1, text.count("\f") + 1)


def _ocr(content: bytes) -> str:
    """OCR is optional: normal text-based PDFs do not need extra system packages."""
    if not shutil.which("pdftoppm") or not shutil.which("tesseract"):
        return ""
    try:
        with tempfile.TemporaryDirectory(prefix="0xtrace-pdf-") as directory:
            source = f"{directory}/source.pdf"
            with open(source, "wb") as handle:
                handle.write(content)
            rendered = subprocess.run(
                ["pdftoppm", "-r", "200", "-png", source, f"{directory}/page"],
                capture_output=True,
                text=True,
                timeout=90,
                check=False,
            )
            if rendered.returncode:
                return ""
            text: list[str] = []
            for page in sorted(Path(directory).glob("page-*.png")):
                result = subprocess.run(
                    ["tesseract", str(page), "stdout", "--dpi", "200"],
                    capture_output=True,
                    text=True,
                    timeout=45,
                    check=False,
                )
                if result.returncode == 0:
                    text.append(result.stdout)
            return "\n\n".join(text)
    except (OSError, subprocess.TimeoutExpired):
        return ""


def extract_pdf_text(content: bytes) -> ExtractedPdf:
    layout_text = _normalise(_pdftotext_layout(content))
    if len(layout_text) >= 80:
        return ExtractedPdf(
            text=layout_text,
            page_count=_page_count(content, layout_text),
            method="layout",
        )

    native_text = ""
    native_error: PdfExtractionError | None = None
    try:
        raw_native, page_count = _pypdf_text(content)
        native_text = _normalise(raw_native)
    except PdfExtractionError as exc:
        native_error = exc
        page_count = 0

    if len(native_text) >= 80:
        return ExtractedPdf(text=native_text, page_count=page_count, method="native")

    ocr_text = _normalise(_ocr(content))
    if len(ocr_text) >= 20:
        return ExtractedPdf(
            text=ocr_text,
            page_count=page_count or _page_count(content, ocr_text),
            method="ocr",
        )

    if native_error is not None and len(layout_text) < 80:
        raise native_error
    raise PdfExtractionError(
        "No readable text was found. Upload a text-based PDF, or install Tesseract for scanned PDFs."
    )
