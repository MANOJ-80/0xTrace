from app.raw_main import section_raw_text


def test_sections_preserve_every_character() -> None:
    text = "Intro\nRound 1: OA\nall words\nInsights:\nnotes\nContact: 123\nALL THE BEST !!!"
    sections = section_raw_text(text)
    assert "".join(section.raw_text for section in sections) == text
    assert [section.kind for section in sections] == ["document", "round", "insights", "contact", "conclusion"]
