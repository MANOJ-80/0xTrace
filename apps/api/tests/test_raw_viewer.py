from pathlib import Path

from app.pdf_text import extract_pdf_text
from app.raw_viewer import map_sections_losslessly


def test_verizon_is_lossless_and_rounds_are_mapped() -> None:
    path = Path(__file__).resolve().parents[3] / "ExperiencePDFs" / "Candidate M.pdf"
    raw = extract_pdf_text(path.read_bytes()).text
    sections = map_sections_losslessly(raw)
    assert "".join(section.raw_text for section in sections) == raw
    assert [section.kind for section in sections].count("round") == 5
    assert any(section.kind == "insights" for section in sections)
