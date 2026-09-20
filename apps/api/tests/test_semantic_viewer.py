from app.semantic_viewer import split_blocks


def test_blocks_are_lossless() -> None:
    text = "Company\n\nRound 1\nDetails\n\nInsights\nAll text"
    blocks = split_blocks(text)
    assert "".join(block.raw_text for block in blocks) == text
