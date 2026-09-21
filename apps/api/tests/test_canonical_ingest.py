import json
import tempfile
from pathlib import Path
from app.canonical_ingest import ingest_to_canonical, validate_draft


def test_validate_draft_checks_required_fields():
    # Empty draft should fail
    errors = validate_draft({})
    assert len(errors) > 0

    # Valid draft should pass
    valid = {
        "company": {"name": "TestCorp"},
        "job": {"role": "SDE"},
        "rounds": [{"name": "Round 1", "raw_content": "Some text"}],
        "outcome": {"status": "selected"},
        "raw_text": "Complete raw text",
    }
    assert validate_draft(valid) == []


def test_ingest_to_canonical_appends_and_increments_id():
    initial_dataset = {
        "dataset_metadata": {
            "title": "Test Dataset",
            "total_experiences": 1,
            "validation": {
                "source_experience_count": 1,
                "output_experience_count": 1,
                "source_round_count": 2,
                "total_interview_questions": 3,
                "total_coding_problems": 1,
            }
        },
        "experiences": [
            {
                "id": "exp_001",
                "source": {"experience_number": 1},
                "company": {"name": "ExistingCorp"},
                "job": {"role": "SDE"},
                "rounds": [
                    {"sequence": 1, "name": "OA", "raw_content": "OA content", "questions": [{"question": "q1"}]},
                    {"sequence": 2, "name": "Tech", "raw_content": "Tech content", "questions": [{"question": "q2"}, {"question": "q3"}], "coding": {"problems": [{"title": "p1"}]}}
                ],
                "outcome": {"status": "selected"},
                "raw_text": "raw 1"
            }
        ]
    }

    with tempfile.TemporaryDirectory() as tmpdir:
        test_file = Path(tmpdir) / "test_canonical.json"
        with open(test_file, "w") as f:
            json.dump(initial_dataset, f)

        new_draft = {
            "company": {"name": "NewTech", "normalized_name": "NewTech"},
            "job": {"role": "Backend Engineer"},
            "rounds": [
                {
                    "name": "Technical Interview",
                    "type": "technical",
                    "raw_content": "Technical round content",
                    "questions": [{"question": "Explain indexes"}],
                    "coding": {"problems": [{"title": "Two Sum"}]}
                }
            ],
            "outcome": {"status": "selected"},
            "raw_text": "Complete raw text of new tech",
        }

        res = ingest_to_canonical(new_draft, canonical_path=test_file, create_backup=False)

        assert res["success"] is True
        assert res["assigned_id"] == "exp_002"
        assert res["experience_number"] == 2
        assert res["total_experiences"] == 2

        with open(test_file) as f:
            updated = json.load(f)

        assert len(updated["experiences"]) == 2
        assert updated["experiences"][1]["id"] == "exp_002"
        assert updated["dataset_metadata"]["total_experiences"] == 2
        assert updated["dataset_metadata"]["validation"]["total_interview_questions"] == 4
        assert updated["dataset_metadata"]["validation"]["total_coding_problems"] == 2
