"""Canonical dataset ingestion workflow for 0xTrace.

Validates extracted draft experiences, assigns the next canonical ID,
updates dataset metadata and validation metrics, and atomically appends
the approved record to data/canonical/interview_experiences_v1.3.json.
"""

from __future__ import annotations

import json
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any


def get_default_canonical_path() -> Path:
    current = Path(__file__).resolve()
    for parent in current.parents:
        target = parent / "data" / "canonical" / "interview_experiences_v1.3.json"
        if target.exists():
            return target
    # Fallback to relative from root
    return Path("data/canonical/interview_experiences_v1.3.json").resolve()


def validate_draft(experience: dict[str, Any]) -> list[str]:
    """Basic required field validation against schema V1.3."""
    errors = []
    required_fields = [
        "company", "job", "rounds", "outcome", "raw_text"
    ]
    for rf in required_fields:
        if rf not in experience:
            errors.append(f"Missing required field: '{rf}'")

    if not experience.get("company", {}).get("name") and not experience.get("company", {}).get("normalized_name"):
        errors.append("Experience must have a valid company name.")

    rounds = experience.get("rounds", [])
    if not isinstance(rounds, list) or len(rounds) == 0:
        errors.append("Experience must have at least one interview round.")
    else:
        for idx, r in enumerate(rounds, 1):
            if not r.get("name") and not r.get("original_name"):
                errors.append(f"Round {idx} is missing a name.")
            if not r.get("raw_content"):
                errors.append(f"Round {idx} is missing raw_content.")

    return errors


def ingest_to_canonical(
    draft_experience: dict[str, Any],
    canonical_path: Path | str | None = None,
    create_backup: bool = True
) -> dict[str, Any]:
    """Validates, assigns next ID, and atomically appends to canonical JSON."""
    if canonical_path is None:
        target_file = get_default_canonical_path()
    else:
        target_file = Path(canonical_path).resolve()

    if not target_file.exists():
        raise FileNotFoundError(f"Canonical dataset not found at {target_file}")

    errors = validate_draft(draft_experience)
    if errors:
        raise ValueError(f"Draft experience validation failed: {'; '.join(errors)}")

    with open(target_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    experiences: list[dict[str, Any]] = data.get("experiences", [])

    # Find highest existing experience number
    max_num = 0
    for exp in experiences:
        eid = exp.get("id", "")
        if eid.startswith("exp_"):
            try:
                num = int(eid.replace("exp_", ""))
                if num > max_num:
                    max_num = num
            except ValueError:
                pass

    next_num = max_num + 1
    next_id = f"exp_{next_num:03d}"

    # Prepare approved experience
    approved = dict(draft_experience)
    approved["id"] = next_id
    if "source" not in approved or not isinstance(approved["source"], dict):
        approved["source"] = {}
    approved["source"]["experience_number"] = next_num

    # Ensure rounds sequence
    for seq, r in enumerate(approved.get("rounds", []), 1):
        r["sequence"] = seq

    # Calculate metrics to increment
    new_rounds_count = len(approved.get("rounds", []))
    new_questions_count = sum(len(r.get("questions", [])) for r in approved.get("rounds", []))
    new_coding_count = sum(len(r.get("coding", {}).get("problems", [])) for r in approved.get("rounds", []))

    # Append
    experiences.append(approved)
    data["experiences"] = experiences

    # Update metadata
    meta = data.setdefault("dataset_metadata", {})
    meta["total_experiences"] = len(experiences)
    meta["updated_at"] = datetime.utcnow().isoformat() + "Z"

    val = meta.setdefault("validation", {})
    val["output_experience_count"] = len(experiences)
    val["source_experience_count"] = val.get("source_experience_count", len(experiences) - 1) + 1
    val["source_round_count"] = val.get("source_round_count", 0) + new_rounds_count
    val["v1_3_round_count"] = val.get("v1_3_round_count", 0) + new_rounds_count
    val["total_interview_questions"] = val.get("total_interview_questions", 0) + new_questions_count
    val["total_coding_problems"] = val.get("total_coding_problems", 0) + new_coding_count

    # Backup if requested
    if create_backup:
        backup_file = target_file.with_suffix(".json.bak")
        shutil.copy2(target_file, backup_file)

    # Atomic write via temp file
    temp_file = target_file.with_suffix(".tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    os.replace(temp_file, target_file)

    return {
        "success": True,
        "assigned_id": next_id,
        "experience_number": next_num,
        "total_experiences": len(experiences),
        "experience": approved,
    }
