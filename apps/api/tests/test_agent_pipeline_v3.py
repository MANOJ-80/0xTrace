from app.agent_pipeline_v3 import _infer_round_type


def test_infers_hr_round_type_from_name() -> None:
    round_plan = {"name": "Round 4- HR Round", "type": "unknown"}
    _infer_round_type(round_plan)
    assert round_plan["type"] == "hr_interview"
