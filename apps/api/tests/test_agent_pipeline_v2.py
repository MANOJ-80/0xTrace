from app.agent_pipeline import SourceSpan
from app.agent_pipeline_v2 import build_result


def test_recovery_keeps_every_unassigned_source_span() -> None:
    spans = [SourceSpan("s001", "document", "Header", "Header\n"), SourceSpan("s002", "section", "Round 1: Test", "Round 1: Test\nBody")]
    result = build_result("sample.pdf", 1, "Header\nRound 1: Test\nBody", spans, {"experience": {}, "rounds": [], "document_sections": []})
    assert result["ui_document"]["integrity"]["lossless"]
    assert len(result["experiences"][0]["rounds"]) == 1
