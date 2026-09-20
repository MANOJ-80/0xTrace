from app.semantic_viewer_v2 import split_source_blocks


def test_heading_blocks_are_lossless() -> None:
    text = "Header\nRound 1: OA\nbody\nInsights:\nnotes\nContact: x\nALL THE BEST !!!"
    blocks = split_source_blocks(text)
    assert "".join(block.raw_text for block in blocks) == text
    assert len(blocks) == 5
