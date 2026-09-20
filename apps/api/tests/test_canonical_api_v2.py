from app.canonical_api import SCHEMA, _default
from app.canonical_api_v2 import normalize_experience


def test_normalizes_required_round_fields() -> None:
    candidate = _default(SCHEMA["$defs"]["experience"])
    candidate["rounds"] = [{"sequence": 1, "name": "Round 1", "type": "other"}]
    experience = normalize_experience(candidate, "raw source")
    assert {"sequence", "name", "original_name", "type", "raw_content"} <= set(experience["rounds"][0])
    assert experience["raw_text"] == "raw source"
