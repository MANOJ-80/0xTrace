import json

from app.canonical_api import SCHEMA, _default, _merge


def test_default_experience_contains_required_round_fields() -> None:
    experience = _default(SCHEMA["$defs"]["experience"])
    assert {"id", "candidate", "company", "rounds", "quality", "raw_text"} <= set(experience)
    assert {"sequence", "name", "original_name", "type", "raw_content"} <= set(_default(SCHEMA["$defs"]["round"]))


def test_merge_keeps_canonical_shape() -> None:
    base = {"candidate": {"name": None}, "rounds": []}
    merged = _merge(base, {"candidate": {"name": "A"}})
    assert merged == {"candidate": {"name": "A"}, "rounds": []}
