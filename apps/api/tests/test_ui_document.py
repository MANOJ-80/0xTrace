from app.semantic_viewer import SourceBlock
from app.ui_document import build_ui_document


def test_builds_ordered_ui_document_without_losing_text() -> None:
    blocks = [SourceBlock(id="b001", raw_text="Header\n"), SourceBlock(id="b002", raw_text="Round text\n")]
    labels = {
        "b001": {"section": "metadata", "title": "Candidate", "type": "metadata", "element_type": "heading"},
        "b002": {"section": "round-1", "title": "Round 1", "type": "round", "element_type": "paragraph"},
    }
    document = build_ui_document("sample.pdf", 1, "Header\nRound text\n", blocks, labels)
    assert [section.title for section in document.sections] == ["Candidate", "Round 1"]
    assert "".join(block.text for section in document.sections for block in section.blocks) == document.raw_text
