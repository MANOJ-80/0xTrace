from app.agent_pipeline import SourceSpan, build_document, make_source_spans


def test_source_spans_are_lossless_for_round_dash_format() -> None:
    raw = "Header\nRound 1- Test\nBody\nRound 2- HR\nBody\nTips:\nNotes"
    spans = make_source_spans(raw)
    assert "".join(span.text for span in spans) == raw
    assert len(spans) == 4


def test_document_reconstructs_exact_source() -> None:
    spans = [SourceSpan("s001", "document", "Header", "Header\n"), SourceSpan("s002", "section", "Round 1", "Round 1\nText")]
    plan = {"experience": {"candidate": {"name": "A"}}, "rounds": [{"name": "Round 1", "type": "technical_interview", "source_ids": ["s002"], "coding": {"present": False, "language": None, "problems": []}}], "document_sections": [{"source_id": "s001", "type": "metadata", "title": "Overview"}]}
    result = build_document("sample.pdf", 1, "Header\nRound 1\nText", spans, plan)
    assert result["ui_document"]["integrity"]["lossless"] is True
    assert result["experiences"][0]["rounds"][0]["raw_content"] == "Round 1\nText"
