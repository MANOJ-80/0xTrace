#!/usr/bin/env python3
"""Canonical Dataset Cleaning & Enrichment Script for 0xTrace.

Cleans formatting artifacts, unglues tokens, joins broken line wraps,
normalizes question & coding problem data structures, and updates metadata counts.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from pathlib import Path

# Add apps/api to path for importing quality_agent
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root / "apps" / "api"))

from app.quality_agent import clean_experience


def run_clean_dataset(
    input_path: Path, output_path: Path, dry_run: bool = False
) -> None:
    print(f"Loading canonical dataset from: {input_path}")
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    experiences = data.get("experiences", [])
    print(f"Total experiences loaded: {len(experiences)}")

    # Baseline statistics
    prev_rounds = sum(len(e.get("rounds", [])) for e in experiences)
    prev_questions = sum(
        len(r.get("questions", []))
        for e in experiences
        for r in e.get("rounds", [])
    )
    prev_coding = sum(
        len((r.get("coding") or {}).get("problems", []))
        for e in experiences
        for r in e.get("rounds", [])
    )

    enriched_rounds = 0

    print("Running AI Quality & Normalization Agent on all experiences...")
    for idx, exp in enumerate(experiences, 1):
        prev_round_q_counts = [len(r.get("questions", [])) for r in exp.get("rounds", [])]
        clean_experience(exp)
        new_round_q_counts = [len(r.get("questions", [])) for r in exp.get("rounds", [])]
        for p_cnt, n_cnt in zip(prev_round_q_counts, new_round_q_counts):
            if n_cnt > p_cnt:
                enriched_rounds += 1

    # New statistics
    new_rounds = sum(len(e.get("rounds", [])) for e in experiences)
    new_questions = sum(
        len(r.get("questions", []))
        for e in experiences
        for r in e.get("rounds", [])
    )
    new_coding = sum(
        len((r.get("coding") or {}).get("problems", []))
        for e in experiences
        for r in e.get("rounds", [])
    )

    # Check for remaining wingdings in description
    stray_symbols = 0
    for exp in experiences:
        for r in exp.get("rounds", []):
            desc = r.get("description", "")
            if any(c in desc for c in ["\uf0b7", "\uf0a7", "\u25a1"]):
                stray_symbols += 1

    # Update metadata
    meta = data.setdefault("dataset_metadata", {})
    val = meta.setdefault("validation", {})
    meta["total_experiences"] = len(experiences)
    meta["total_rounds"] = new_rounds
    val["output_experience_count"] = len(experiences)
    val["total_interview_questions"] = new_questions
    val["total_coding_problems"] = new_coding

    print("\n==================================================")
    print("           DATASET CLEANING SUMMARY REPORT        ")
    print("==================================================")
    print(f"Total Experiences:       {len(experiences)}")
    print(f"Total Rounds:            {new_rounds}")
    print(f"Rounds Enriched:         {enriched_rounds}")
    print(f"Questions:               {prev_questions} -> {new_questions} (+{new_questions - prev_questions})")
    print(f"Coding Challenges:       {prev_coding} -> {new_coding} (+{new_coding - prev_coding})")
    print(f"Remaining Stray Symbols: {stray_symbols} (0 expected)")
    print("==================================================\n")

    if dry_run:
        print("[DRY-RUN] No files modified.")
        return

    # Create safety backup
    backup_path = input_path.with_suffix(".json.pre_clean.bak")
    print(f"Creating safety backup at: {backup_path}")
    shutil.copy2(input_path, backup_path)

    # Atomic write to output
    temp_output = output_path.with_suffix(".tmp")
    with open(temp_output, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    temp_output.replace(output_path)
    print(f"Cleaned dataset successfully written to: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Clean and enrich 0xTrace canonical dataset"
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=repo_root
        / "data"
        / "canonical"
        / "interview_experiences_v1.3.json",
        help="Input JSON file path",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=repo_root
        / "data"
        / "canonical"
        / "interview_experiences_v1.3.json",
        help="Output JSON file path",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Perform cleaning and print statistics without saving",
    )
    args = parser.parse_args()

    run_clean_dataset(args.input, args.output, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
