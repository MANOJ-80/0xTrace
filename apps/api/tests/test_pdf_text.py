from pathlib import Path

import pytest

from app.pdf_text import extract_pdf_text


def test_extracts_text_with_layout() -> None:
    root = Path(__file__).resolve().parents[3]
    pdf = root / "data" / "sample.pdf"
    if not pdf.exists():
        pytest.skip("Place a local sample PDF at data/sample.pdf to run this test")
    extracted = extract_pdf_text(pdf.read_bytes())

    assert extracted.page_count == 5
    assert extracted.method in {"layout", "native"}
    assert "Walmart- Interview Experience" in extracted.text
    assert "Object Oriented Programming" in extracted.text
    # Layout extraction keeps the header labels on their own lines.
    assert "\nRole : Software Development Engineer 2" in extracted.text
