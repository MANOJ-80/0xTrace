"""AI Quality & Text Normalization Agent for 0xTrace.

Provides deterministic cleaning, formatting normalization, question/coding harvesting,
and quality auditing for interview experience narratives and rounds.
"""

from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlparse

METADATA_KEYS = [
    "Duration",
    "Mode",
    "Type",
    "Platform",
    "Venue",
    "Date",
    "Time",
    "Difficulty",
    "Difficulty level",
    "Sections",
    "Rules",
    "Note",
    "Description",
    "Business Unit",
]


def extract_url_problem_title(url: str) -> str:
    """Extracts a human-readable coding challenge title from a LeetCode, GFG, or HackerRank URL."""
    try:
        parsed = urlparse(url)
        segments = [
            s
            for s in parsed.path.strip("/").split("/")
            if s
            and not s.isdigit()
            and s.lower()
            not in [
                "problems",
                "practice",
                "challenges",
                "description",
                "problem",
                "editorial",
                "submissions",
                "article",
            ]
        ]
        if not segments:
            return "Online Coding Problem"
        slug = segments[-1]
        slug = re.sub(r"\d{3,}$", "", slug)
        slug = re.sub(r"(?i)puzzle-set-\d+-", "puzzle-", slug)
        slug = slug.replace("-", " ").strip()
        return slug.title()
    except Exception:
        return "Online Coding Problem"


def clean_round_title(name: str, raw_content: str, seq: int, r_type: str = "") -> str:
    """Normalizes round titles, converting generic or awkwardly formatted headings
    like 'ROUND 1' or '(Virtual Interview):' into clean, professional labels.
    """
    clean = (name or "").strip()
    clean = re.sub(r"[\u2013\u2014–—]", "-", clean)
    clean = re.sub(r"(?i)^round\s*-?\s*\d+\s*[:.-]?\s*", "", clean).strip(" -:()")
    clean = re.sub(r"(?i)^r\d+\s*[:.-]?\s*", "", clean).strip(" -:()")

    if (
        not clean
        or clean.lower() in ["round", "round 1", "round 2", "round 3", "round 4", "interview", "technical"]
        or clean.startswith("(")
    ):
        lines = [line.strip() for line in (raw_content or "").split("\n") if line.strip()][:6]
        for line in lines:
            type_m = re.search(r"(?i)\btype\s*:\s*([^,\n]+)", line)
            if type_m:
                val = type_m.group(1).strip()
                if 2 < len(val) < 45:
                    clean = val
                    break
            header_m = re.search(r"(?i)round\s*[\d–-]+\s*[:.-]\s*([^\n]+)", line)
            if header_m:
                val = header_m.group(1).strip(" -:()")
                if 2 < len(val) < 50:
                    clean = val
                    break

    clean = clean.strip(" -:()")
    if not clean:
        type_display = r_type.replace("_", " ").title() if r_type else "Technical Interview"
        clean = type_display

    return f"Round {seq}: {clean}"


def clean_text(text: str | None) -> str:
    """Normalizes formatting noise, unglues tokens, joins mid-sentence page wraps,
    and standardizes bullet points while preserving paragraphs and metadata boundaries.
    """
    if not text:
        return ""

    # 1. Normalize line endings, tabs, zero-width spaces, replacement chars, and unusual unicode whitespace
    t = text.replace("\r\n", "\n").replace("\r", "\n")
    t = t.replace("\t", "  ").replace("\x0c", "\n")
    t = (
        t.replace("\u00a0", " ")
        .replace("\u200b", "")
        .replace("\ufeff", "")
        .replace("\ufffd", "")
    )
    # Strip non-printable ASCII control characters
    t = re.sub(r"[\x00-\x08\x0b\x0e-\x1f]", "", t)

    # Fix broken line-wrap hyphenation (e.g. "real- time" -> "real-time", "front- end" -> "front-end")
    t = re.sub(r"\b([a-zA-Z]{3,})-\s+([a-zA-Z]{3,})\b", r"\1-\2", t)

    # Collapse excessive horizontal spaces
    t = re.sub(r"[^\S\r\n]{3,}", " ", t)

    # 2. Replace all stray bullet symbols with standard bullet
    t = re.sub(
        r"[\uf0b7\uf0a7\u25a1\u25aa\u25cf\u2023\u2043\u2219\u25cb\u27a2\u2794\u2b9a\u2756\u2740\u2605]",
        "• ",
        t,
    )
    # Lowercase 'o' used as a bullet point at start of line
    t = re.sub(r"(?m)^\s*o\s+(?=[A-Za-z0-9http])", "• ", t)

    # 3. Collapse stacked bullets (e.g. • \n• \n -> • )
    t = re.sub(r"(?:^[ \t]*•\s*\n){2,}", "", t, flags=re.MULTILINE)

    # 4. Strip leaked multi-round TOC at the very top of a round body
    t = re.sub(
        r"^(?:(?:Round\s*\d+|R\d+|\d+[\.)])[^\n]+\n){2,6}(?=(?:Round\s*1\b|Round\s*[-–—]?\s*1\b|ROUND\s*1\b|Type\s*:))",
        "",
        t,
        flags=re.IGNORECASE,
    )

    # 5. Fix glued punctuation:
    # 5a. Period glued to uppercase letter (including pronoun 'I')
    t = re.sub(
        r"(?<!\be\.g)(?<!\bi\.e)(?<!\bvs)(?<!\bv)(?<=[a-z0-9\)])\.(?=[A-Z])",
        ". ",
        t,
    )

    # 5b. Glued commas: "word,next" -> "word, next"
    t = re.sub(r"(?<=[a-zA-Z]),(?=[a-zA-Z])", ", ", t)

    # 5c. Time glued to word: "10:00 AMDuration:" -> "10:00 AM Duration:"
    t = re.sub(r"\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))(?=[A-Za-z])", r"\1 ", t)

    # 5d. Ensure newline and proper spacing before key metadata labels
    for key in METADATA_KEYS:
        t = re.sub(rf"(?i)(?<!\n)\b({key}\s*:)", r"\n\1", t)
        t = re.sub(rf"(?i)\b({key})\s*:\s*([^\s/])", r"\1: \2", t)

    # 6. Fix mid-sentence line wraps without collapsing headers, bullets, or questions
    lines = t.split("\n")
    cleaned_lines: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line:
            cleaned_lines.append("")
            i += 1
            continue

        is_current_meta = any(
            re.match(rf"^(?:round\s*\d+|{key})\s*:", line, re.I)
            for key in METADATA_KEYS
        )
        if is_current_meta:
            cleaned_lines.append(line)
            i += 1
            continue

        while i + 1 < len(lines):
            next_line = lines[i + 1].strip()
            if not next_line:
                break

            is_next_meta = any(
                re.match(rf"^(?:round\s*\d+|{key})\s*:", next_line, re.I)
                for key in METADATA_KEYS
            )
            is_next_bullet = bool(
                re.match(r"^\s*[•\-*●]\s+", next_line)
                or re.match(r"^\s*\d+[\.)]\s+", next_line)
            )
            ends_terminal = bool(re.search(r"[.:!?;]$", line))
            starts_question = bool(
                re.match(
                    r"^(?:what|why|how|explain|differentiate|describe|can you|reverse|write|find)\b",
                    next_line,
                    re.I,
                )
            )

            if not ends_terminal and not is_next_meta and not is_next_bullet and not starts_question:
                line = line + " " + next_line
                i += 1
            else:
                break

        cleaned_lines.append(line)
        i += 1

    result = "\n".join(cleaned_lines)
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result.strip()


def infer_question_topic(question_text: str) -> tuple[str, str]:
    """Infers (topic, category) from question text."""
    lower = question_text.lower()
    if any(
        w in lower
        for w in [
            "why ",
            "hier you",
            "hire you",
            "introduce",
            "self intro",
            "strength",
            "weakness",
            "tell me about yourself",
            "leadership",
            "conflict",
            "behaviour",
            "culture",
            "prefer",
            "relocation",
            "family",
        ]
    ):
        return ("HR & Behavioral", "hr")
    if any(
        w in lower
        for w in [
            "pointer",
            "null pointer",
            "dangling pointer",
            "c++",
            "java",
            "python",
            "virtual function",
            "destructor",
            "constructor",
            "memory management",
            "garbage collect",
            "type-safe",
        ]
    ):
        return ("Language Fundamentals & Pointers", "technical")
    if any(
        w in lower
        for w in [
            "dbms",
            "sql",
            "acid",
            "index",
            "indexing",
            "normalization",
            "transaction",
            "foreign key",
            "primary key",
            "joins",
            "nosql",
            "b-tree",
        ]
    ):
        return ("DBMS & SQL", "technical")
    if any(
        w in lower
        for w in [
            "os",
            "process",
            "thread",
            "deadlock",
            "paging",
            "virtual memory",
            "semaphore",
            "mutex",
            "context switch",
            "lru cache",
        ]
    ):
        return ("Operating Systems", "technical")
    if any(
        w in lower
        for w in [
            "cn",
            "tcp",
            "udp",
            "http",
            "https",
            "ip address",
            "osi model",
            "dns",
            "handshake",
            "socket",
            "packet",
            "routing",
            "bgp",
        ]
    ):
        return ("Computer Networks", "technical")
    if any(
        w in lower
        for w in [
            "oop",
            "polymorphism",
            "inheritance",
            "encapsulation",
            "abstraction",
            "interface",
            "class",
            "solid principles",
        ]
    ):
        return ("Object Oriented Programming", "technical")
    if any(
        w in lower
        for w in [
            "system design",
            "scalability",
            "microservices",
            "load balancer",
            "caching",
            "kafka",
            "redis",
            "rate limiter",
            "management system",
        ]
    ):
        return ("System Design", "technical")
    if any(w in lower for w in ["project", "internship", "resume", "github"]):
        return ("Projects & Experience", "technical")
    if any(
        w in lower
        for w in [
            "tree",
            "graph",
            "array",
            "linked list",
            "stack",
            "queue",
            "heap",
            "hash map",
            "recursion",
            "dynamic programming",
            "sorting",
        ]
    ):
        return ("Data Structures & Algorithms", "technical")
    return ("Core CS Concepts", "technical")


def infer_coding_problem(problem_entry: Any) -> dict[str, Any] | None:
    """Normalizes a coding problem into a structured dict with title, description, and tags.
    Returns None if the entry is invalid or purely commentary.
    """
    if isinstance(problem_entry, dict):
        title = problem_entry.get("title") or "Coding Problem"
        desc = problem_entry.get("description") or title
        diff = problem_entry.get("difficulty") or "medium"
        topics = problem_entry.get("topics") or []
    else:
        text = str(problem_entry).strip()
        url_match = re.search(r"https?://[^\s)]+", text)
        if url_match:
            url = url_match.group(0)
            url_title = extract_url_problem_title(url)
            prefix = text.split("http")[0].strip(" -:()•➢o123456789.")
            if len(prefix) > 6 and not any(
                w in prefix.lower()
                for w in ["solve the problem at", "my classmates had", "refer", "link"]
            ):
                title = prefix
            else:
                title = url_title
            desc = text
        else:
            clean_t = re.sub(
                r"^[\s•\-*?●\uf0b7\uf0a7\u25a1\u25aa\u27a2\d+\.)]+", "", text
            ).strip()
            title = clean_t
            desc = clean_t

        if len(title) > 80:
            title = title[:77] + "..."

        diff = "medium"
        topics: list[str] = []
        lower = desc.lower()
        if "tree" in lower or "bst" in lower:
            topics.append("Binary Trees")
        if "linked list" in lower:
            topics.append("Linked Lists")
        if "dynamic programming" in lower or "dp" in lower:
            topics.append("Dynamic Programming")
        if "graph" in lower or "dfs" in lower or "bfs" in lower:
            topics.append("Graphs")
        if "array" in lower or "subarray" in lower or "two pointer" in lower:
            topics.append("Arrays")
        if "string" in lower or "palindrome" in lower or "anagram" in lower:
            topics.append("Strings")
        if "prime" in lower or "puzzle" in lower or "math" in lower:
            topics.append("Math & Puzzles")
        if "design" in lower:
            topics.append("System Design")
        if not topics:
            topics.append("Data Structures & Algorithms")

    # Reject invalid titles
    clean_title = re.sub(r"[^\w\s]", "", title).strip()
    if (
        len(clean_title) < 3
        or clean_title.isdigit()
        or clean_title.lower() in ["coding problem", "online coding problem", "none", "null", "1", "o"]
    ):
        return None
    if any(
        comment in title.lower()
        for comment in ["the questions were not direct", "selection criteria", "overall an easy round"]
    ):
        return None

    return {
        "title": title,
        "description": desc,
        "difficulty": diff,
        "topics": topics,
    }


def normalize_questions(raw_questions: list[Any]) -> list[dict[str, Any]]:
    """Converts a list of questions (strings or dicts) into standard InterviewQuestion objects."""
    result: list[dict[str, Any]] = []
    seen: set[str] = set()

    for item in raw_questions or []:
        if isinstance(item, dict):
            q_text = item.get("question") or item.get("text") or ""
            topic = item.get("topic")
            category = item.get("category")
            diff = item.get("difficulty") or "medium"
            details = item.get("details")
        else:
            q_text = str(item).strip()
            topic = None
            category = None
            diff = "medium"
            details = None

        clean_q = re.sub(
            r"^[\s•\-*?●\uf0b7\uf0a7\u25a1\u25aa\u27a2\d+\.)]+", "", q_text
        ).strip()
        if clean_q.lower().startswith("combination sum") and len(clean_q) > 80:
            details = clean_q
            clean_q = "Solve Combination Sum (handling duplicates, constraints & recursion tree)"
            topic = "Dynamic Programming"
            category = "technical"

        norm_key = re.sub(r"[^\w\s]", "", clean_q.lower()).strip()
        if not norm_key or norm_key in seen or len(clean_q) < 4:
            continue
        seen.add(norm_key)

        if not topic or not category:
            inferred_topic, inferred_cat = infer_question_topic(clean_q)
            topic = topic or inferred_topic
            category = category or inferred_cat

        result.append(
            {
                "question": clean_q,
                "topic": topic,
                "difficulty": diff,
                "category": category,
                "details": details,
            }
        )
    return result


def harvest_questions_and_coding_from_text(
    text: str,
    existing_questions: list[dict[str, Any]],
    existing_coding: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Scans text for interview questions and coding problems not already captured,
    including discrete lines, bulleted prompts, and narrative discussion sentences.
    """
    new_questions = list(existing_questions)
    new_coding = list(existing_coding)

    seen_q = {
        re.sub(r"[^\w\s]", "", q["question"].lower()).strip()
        for q in new_questions
        if "question" in q
    }
    seen_c = {
        re.sub(r"[^\w\s]", "", c["title"].lower()).strip()
        for c in new_coding
        if "title" in c
    }

    # 1. Line-by-line discrete prompt check
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    for line in lines:
        clean_l = re.sub(
            r"^[\s•\-*?●\uf0b7\uf0a7\u25a1\u25aa\u27a2\d+\.)]+", "", line
        ).strip()
        if len(clean_l) < 8 or len(clean_l) > 350:
            continue

        lower = clean_l.lower()

        if any(
            lower.startswith(m)
            for m in [
                "round",
                "duration",
                "mode",
                "platform",
                "venue",
                "difficulty level",
                "note:",
                "type:",
            ]
        ):
            continue

        # Check for Coding Problem patterns
        is_coding = False
        if any(
            w in lower
            for w in [
                "leetcode",
                "geeksforgeeks.org",
                "hackerrank",
                "reverse the ",
                "find distance between",
                "design a bank",
                "design a ",
                "write a program to",
                "write code to",
                "write a function to",
                "pseudo code for the optimal",
            ]
        ):
            is_coding = True
        elif clean_l.startswith("http://") or clean_l.startswith("https://"):
            is_coding = True

        if is_coding:
            prob = infer_coding_problem(clean_l)
            if prob:
                c_key = re.sub(r"[^\w\s]", "", prob["title"].lower()).strip()
                if c_key not in seen_c and len(prob["title"]) > 3:
                    seen_c.add(c_key)
                    new_coding.append(prob)
            continue

        # Check for Interview Question patterns
        is_q = False
        if clean_l.endswith("?"):
            is_q = True
        elif any(
            lower.startswith(p)
            for p in [
                "what is",
                "what are",
                "why ",
                "explain ",
                "how does",
                "how do",
                "differentiate between",
                "difference between",
                "compare ",
                "describe ",
                "can you ",
                "tell me about",
                "briefly explain",
                "define ",
            ]
        ):
            is_q = True

        if is_q:
            q_key = re.sub(r"[^\w\s]", "", clean_l.lower()).strip()
            if q_key not in seen_q:
                seen_q.add(q_key)
                topic, cat = infer_question_topic(clean_l)
                new_questions.append(
                    {
                        "question": clean_l,
                        "topic": topic,
                        "difficulty": "medium",
                        "category": cat,
                        "details": None,
                    }
                )

    # 2. Sentence-level narrative harvester for candidate experience summaries
    sentences = re.split(r"(?<=[.!?])\s+|\n+", text)
    for s in sentences:
        s = s.strip()
        if len(s) < 15 or len(s) > 250:
            continue

        # Coding problems described in narrative
        coding_match = re.search(
            r"(?:asked to|told to|had to|dive into|dived into)\s+(?:design|code|implement|solve|write a program for|write code for)\s+([^.!?]+)",
            s,
            re.I,
        )
        if coding_match:
            item = coding_match.group(1).strip(" -:()")
            item = re.sub(r"\s+with the given.*", "", item, flags=re.I)
            item = re.sub(r"\s+in\s+(?:python|c\+\+|java|c).*", "", item, flags=re.I)
            if 5 < len(item) < 80:
                title = item[0].upper() + item[1:]
                if not any(
                    title.lower().startswith(p)
                    for p in ["design", "implement", "solve", "reverse"]
                ):
                    title = f"Design/Implement {title}"
                c_key = re.sub(r"[^\w\s]", "", title.lower()).strip()
                if c_key not in seen_c:
                    seen_c.add(c_key)
                    new_coding.append(
                        {
                            "title": title,
                            "description": s,
                            "difficulty": "medium",
                            "topics": [
                                "System Design"
                                if "design" in title.lower()
                                else "Data Structures & Algorithms"
                            ],
                        }
                    )
            continue

        # Interview questions described in narrative
        q_match = re.search(
            r"(?:asked(?:\s+me)?\s+(?:about|to explain|to describe|to give|regarding|questions on))\s+([^.!?]+)",
            s,
            re.I,
        )
        if q_match:
            item = q_match.group(1).strip(" -:()")
            if any(
                bad in item.lower()
                for bad in [
                    "him the same",
                    "one topic",
                    "another project",
                    "the interview",
                    "time to",
                    "if i had",
                ]
            ):
                continue
            if 4 < len(item) < 90:
                q_text = f"Discussion on {item}"
                if any(k in item.lower() for k in ["intro", "self", "about myself"]):
                    q_text = "Candidate Self-Introduction & Background"
                elif "project" in item.lower():
                    q_text = f"Project Deep Dive: {item}"
                elif any(
                    k in item.lower()
                    for k in ["favourite", "favorite", "subject"]
                ):
                    q_text = f"Core Fundamentals: {item}"
                elif any(
                    c in item.lower()
                    for c in ["acko", "amazon", "caterpillar", "sap", "fiorana", "qualcomm", "walmart"]
                ):
                    q_text = f"Company Knowledge & Culture: {item}"

                q_key = re.sub(r"[^\w\s]", "", q_text.lower()).strip()
                if q_key not in seen_q:
                    seen_q.add(q_key)
                    topic, cat = infer_question_topic(q_text)
                    new_questions.append(
                        {
                            "question": q_text,
                            "topic": topic,
                            "difficulty": "medium",
                            "category": cat,
                            "details": s,
                        }
                    )

    return new_questions, new_coding


def clean_round(round_data: dict[str, Any]) -> dict[str, Any]:
    """Cleans a single round: standardizes title, normalizes text into clean narrative,
    and harvests structured questions and coding problems with strict deduplication.
    """
    raw_content = round_data.get("raw_content") or ""
    seq = round_data.get("sequence") or 1
    r_type = round_data.get("type") or "technical"

    # Clean narrative
    clean_narrative = clean_text(raw_content)

    # Clean round title using cleaned text
    current_name = round_data.get("name") or f"Round {seq}"
    cleaned_name = clean_round_title(current_name, clean_narrative, seq, r_type)

    # Normalize existing questions and coding problems
    norm_questions = normalize_questions(round_data.get("questions") or [])
    raw_coding_list = (round_data.get("coding") or {}).get("problems") or []
    norm_coding = []
    for p in raw_coding_list:
        inf = infer_coding_problem(p)
        if inf:
            norm_coding.append(inf)

    # Harvest embedded questions or coding problems
    final_questions, final_coding = harvest_questions_and_coding_from_text(
        clean_narrative, norm_questions, norm_coding
    )

    # Deduplicate questions
    unique_questions: list[dict[str, Any]] = []
    seen_q = set()
    for q in final_questions:
        q_text = q.get("question", "").strip()
        q_key = re.sub(r"[^\w\s]", "", q_text.lower()).strip()
        if q_key and q_key not in seen_q and len(q_text) > 3:
            seen_q.add(q_key)
            unique_questions.append(q)

    # Deduplicate coding problems
    unique_coding: list[dict[str, Any]] = []
    seen_c = set()
    for p in final_coding:
        c_title = p.get("title", "").strip()
        c_key = re.sub(r"[^\w\s]", "", c_title.lower()).strip()
        if c_key and c_key not in seen_c and len(c_title) > 3:
            seen_c.add(c_key)
            unique_coding.append(p)

    # Update round dictionary
    round_data["name"] = cleaned_name
    round_data["description"] = clean_narrative
    round_data["raw_content"] = raw_content  # Preserve untouched raw for lossless audit
    round_data["questions"] = unique_questions
    round_data["coding"] = {
        "problem_count": len(unique_coding),
        "problems": unique_coding,
    }

    return round_data


def assess_quality(experience: dict[str, Any]) -> dict[str, Any]:
    """Calculates data quality score and audit issues for an experience."""
    issues: list[str] = []
    score = 100

    cand = experience.get("candidate") or {}
    if not cand.get("name") or cand.get("name") == "Candidate":
        score -= 5
        issues.append("Candidate name is generic or missing.")

    comp = experience.get("company") or {}
    if not comp.get("name"):
        score -= 15
        issues.append("Company name is missing.")

    rounds = experience.get("rounds") or []
    if not rounds:
        score -= 30
        issues.append("No rounds extracted.")
    else:
        for r in rounds:
            seq = r.get("sequence") or 1
            if not r.get("description") and not r.get("raw_content"):
                score -= 10
                issues.append(f"Round {seq} has empty content.")
            desc = r.get("description") or ""
            if any(char in desc for char in ["\uf0b7", "\uf0a7", "\u25a1"]):
                score -= 5
                issues.append(f"Round {seq} contains un-normalized symbol characters.")

    outcome = experience.get("outcome") or {}
    if not outcome.get("status"):
        score -= 5
        issues.append("Outcome status unspecified.")

    score = max(0, min(100, score))
    return {
        "score": score,
        "lossless": True,
        "cleaned": True,
        "issues": issues,
    }


def clean_experience(experience: dict[str, Any]) -> dict[str, Any]:
    """Full normalization and quality pass for an entire interview experience."""
    cleaned_rounds = []
    for r in experience.get("rounds") or []:
        cleaned_rounds.append(clean_round(r))
    experience["rounds"] = cleaned_rounds

    cleaned_tips = []
    for tip in experience.get("tips") or []:
        c_tip = clean_text(tip)
        if c_tip:
            cleaned_tips.append(c_tip)
    experience["tips"] = cleaned_tips

    if experience.get("conclusion"):
        experience["conclusion"] = clean_text(experience["conclusion"])

    # Standardize outcome status
    outcome = experience.setdefault("outcome", {})
    stat = (outcome.get("status") or "").lower().strip()
    if stat in ["not_selected", "not selected", "unplaced", "not placed"]:
        outcome["status"] = "rejected"
    elif stat in ["selected", "placed", "offered", "got offer", "hired"]:
        outcome["status"] = "selected"
    elif not stat or stat in ["unknown", "none", "null"]:
        outcome["status"] = "completed"

    # Candidate name fallback
    cand = experience.setdefault("candidate", {})
    if not cand.get("name") or cand["name"].strip() in ["", "Candidate", "None", "null"]:
        raw_t = experience.get("raw_text", "")
        sujay_m = re.search(r"I am\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)", raw_t)
        if sujay_m:
            cand["name"] = sujay_m.group(1).strip()
        else:
            cand["name"] = "PSG Tech Student"

    experience["quality"] = assess_quality(experience)

    return experience
