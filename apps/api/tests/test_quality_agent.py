from app.quality_agent import (
    clean_text,
    infer_question_topic,
    infer_coding_problem,
    normalize_questions,
    harvest_questions_and_coding_from_text,
    clean_round,
    clean_experience,
    assess_quality,
)


def test_clean_text_normalizes_artifacts():
    dirty = "Round 2\nType: Technical\nInterview\nDuration:1hour\nMode:Offline\n\uf0b7\n\uf0b7\noffice.The interview started.\n10:00 AMDuration: 1hr"
    cleaned = clean_text(dirty)
    assert "\uf0b7" not in cleaned
    assert "office. The interview" in cleaned
    assert "10:00 AM" in cleaned
    assert "Duration: 1hr" in cleaned
    assert "Duration: 1hour" in cleaned
    assert "Mode: Offline" in cleaned


def test_infer_question_topic():
    topic, cat = infer_question_topic("What is Pointer? Explain dangling pointer.")
    assert topic == "Language Fundamentals & Pointers"
    assert cat == "technical"

    topic, cat = infer_question_topic("Why should we hire you?")
    assert topic == "HR & Behavioral"
    assert cat == "hr"

    topic, cat = infer_question_topic("Explain ACID properties in DBMS.")
    assert topic == "DBMS & SQL"
    assert cat == "technical"


def test_infer_coding_problem():
    prob = infer_coding_problem("https://www.geeksforgeeks.org/find-distance-between-two-nodes-of-a-binary-tree/")
    assert "Binary Tree" in prob["title"] or "Distance" in prob["title"]
    assert "Binary Trees" in prob["topics"]

    prob2 = infer_coding_problem("Reverse the doubly linked list using 2 pointers")
    assert prob2["title"] == "Reverse the doubly linked list using 2 pointers"
    assert "Linked Lists" in prob2["topics"]


def test_clean_round_and_experience():
    exp = {
        "id": "exp_test",
        "candidate": {"name": "Test User"},
        "company": {"name": "Acme Corp"},
        "rounds": [
            {
                "sequence": 1,
                "name": "Round 1 - Technical",
                "raw_content": "Round 1\nDuration: 45m\n\uf0b7 What is deadlock in OS?\nReverse the singly linked list\nWhy Acme Corp?",
                "questions": [],
                "coding": {"problems": []},
            }
        ],
        "outcome": {"status": "selected"},
        "tips": ["Prepare core CS subjects."],
    }
    cleaned = clean_experience(exp)
    r = cleaned["rounds"][0]
    assert len(r["questions"]) >= 2
    assert any(q["question"] == "What is deadlock in OS?" for q in r["questions"])
    assert any(q["question"] == "Why Acme Corp?" for q in r["questions"])
    assert len(r["coding"]["problems"]) >= 1
    assert cleaned["quality"]["score"] > 80
    assert cleaned["quality"]["lossless"] is True
