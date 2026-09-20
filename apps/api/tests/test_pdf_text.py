from pathlib import Path

from app.pdf_text import extract_pdf_text


def test_extracts_text_from_example_pdf() -> None:
    root = Path(__file__).resolve().parents[3]
    pdf = root / "ExperiencePDFs" / "Candidate_C.pdf"
    extracted = extract_pdf_text(pdf.read_bytes())

    assert extracted.page_count == 5
    assert extracted.method == "native"
    assert "Walmart- Interview Experience" in extracted.text
    assert "Object Oriented Programming" in extracted.text
