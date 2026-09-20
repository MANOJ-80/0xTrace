from app.agent_pipeline_v4 import polish_document


def test_duplicate_source_round_names_get_unique_ui_names() -> None:
    result = {"experiences": [{"rounds": [{"sequence": 1, "name": "Round 2", "original_name": "Round 2: Technical [60 min]", "raw_content": "a"}, {"sequence": 2, "name": "Round 2", "original_name": "Round 2: Technical [90 min]", "raw_content": "b"}]}], "ui_document": {"sections": [{"type": "round", "title": "Round 2", "raw_content": "a"}, {"type": "round", "title": "Round 2", "raw_content": "b"}]}}
    polished = polish_document(result)
    assert [round_data["name"] for round_data in polished["experiences"][0]["rounds"]] == ["Round 1 - Technical", "Round 2 - Technical"]
