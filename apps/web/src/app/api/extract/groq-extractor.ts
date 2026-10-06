/**
 * Multi-stage extraction pipeline.
 * Stage 1: PDF → Text (handled by route.ts)
 * Stage 2: Text → Chunks (deterministic regex)
 * Stage 3: Chunks → Structured JSON (focused LLM prompts)
 * Stage 4: Assembly → Final Experience
 */

import { chunkDocument, type ChunkedDocument, type RoundChunk } from "@/lib/chunker";
import { llmExtractJSON } from "@/lib/llm-providers";
import { parseExtractionResult } from "@/lib/extraction-schema";
import { cleanExtractedExperience } from "@/lib/quality-clean";
import type { ExtractionResponse, Experience } from "@/lib/types";
import crypto from "crypto";

/* ------------------------------------------------------------------ */
/*  Stage 3a: LLM — Header Extraction                                 */
/* ------------------------------------------------------------------ */

async function extractHeader(headerChunk: string, programmatic: ChunkedDocument["programmatic"]) {
  // If we already got company + candidate programmatically, skip LLM for header
  if (programmatic.company_name && programmatic.candidate_name) {
    return {
      candidate_name: programmatic.candidate_name,
      company_name: programmatic.company_name,
      department: programmatic.department,
      college: programmatic.college,
      role: null,
      employment_type: null,
      degree: null,
    };
  }

  // Only call LLM if programmatic extraction missed something
  const { data } = await llmExtractJSON(
    `Extract candidate and company information from this interview experience header.
Return JSON: { "candidate_name": string|null, "company_name": string|null, "department": string|null, "degree": string|null, "college": string|null, "role": string|null, "employment_type": "full_time"|"internship"|"internship_plus_fte"|null }`,
    headerChunk,
    300
  );

  return {
    candidate_name: data.candidate_name || programmatic.candidate_name,
    company_name: data.company_name || programmatic.company_name,
    department: data.department || programmatic.department,
    college: data.college || programmatic.college,
    role: data.role || null,
    employment_type: data.employment_type || null,
    degree: data.degree || null,
  };
}

/* ------------------------------------------------------------------ */
/*  Stage 3b: LLM — Per-Round Extraction                               */
/* ------------------------------------------------------------------ */

async function extractRound(chunk: RoundChunk) {
  const { data } = await llmExtractJSON(
    `Extract interview questions and coding problems from this interview round text.
Each interview question should be a SEPARATE item. Identify coding problems by algorithm names, LeetCode references, or problem statements.
Return JSON: {
  "description": "brief narrative of what happened in this round",
  "questions": [{ "question": "the actual question asked", "topic": "OS|DBMS|DSA|OOPS|Python|Java|SQL|HR|Behavioral|null", "category": "technical|behavioral|hr|null" }],
  "coding_problems": [{ "title": "short title", "description": "problem statement", "difficulty": "easy|medium|hard|null", "topics": ["array","string","dp","graph","tree","greedy","math","other"] }],
  "shortlisted_count": number|null,
  "sections": [{ "name": "section name", "question_count": number }]
}`,
    chunk.raw,
    800
  );

  return {
    sequence: chunk.sequence,
    name: `Round ${chunk.sequence}`,
    original_name: chunk.detected_name,
    type: chunk.detected_type,
    date: chunk.detected_date,
    mode: chunk.detected_mode,
    platform: chunk.detected_platform,
    duration: chunk.detected_duration,
    difficulty: chunk.detected_difficulty,
    description: data.description || null,
    raw_content: chunk.raw,
    questions: (data.questions || []).filter((q: any) => q && q.question),
    coding: {
      problem_count: (data.coding_problems || []).length || null,
      problems: (data.coding_problems || []).filter((p: any) => p && p.title),
    },
    shortlisting: data.shortlisted_count
      ? { shortlisted: data.shortlisted_count }
      : {},
    sections: data.sections || [],
  };
}

/* ------------------------------------------------------------------ */
/*  Stage 3c: LLM — Tips & Conclusion                                 */
/* ------------------------------------------------------------------ */

async function extractTips(tipsChunk: string | null, resultChunk: string | null) {
  if (!tipsChunk && !resultChunk) {
    return { tips: [], conclusion: null };
  }

  const text = [tipsChunk, resultChunk].filter(Boolean).join("\n\n");

  const { data } = await llmExtractJSON(
    `Extract tips/advice and any concluding remarks from this text.
Each tip should be a SEPARATE string in the array.
Return JSON: { "tips": ["tip 1", "tip 2", ...], "conclusion": "concluding remark or null" }`,
    text,
    400
  );

  return {
    tips: Array.isArray(data.tips) ? data.tips : [],
    conclusion: data.conclusion || null,
  };
}

/* ------------------------------------------------------------------ */
/*  Main Pipeline                                                      */
/* ------------------------------------------------------------------ */

export async function extractWithGroq(
  rawText: string,
  filename: string,
  pageCount: number
): Promise<ExtractionResponse> {
  // ── Stage 2: Chunk the document ──
  const chunks = chunkDocument(rawText);
  console.log(`[Pipeline] Chunked: ${chunks.round_chunks.length} rounds, company="${chunks.programmatic.company_name}", candidate="${chunks.programmatic.candidate_name}"`);

  // ── Stage 3a: Extract header (LLM only if needed) ──
  const header = await extractHeader(chunks.header_chunk, chunks.programmatic);
  console.log(`[Pipeline] Header: company="${header.company_name}", candidate="${header.candidate_name}"`);

  // ── Stage 3b: Extract each round (LLM per round) ──
  const rounds = [];
  for (const roundChunk of chunks.round_chunks) {
    try {
      console.log(`[Pipeline] Extracting Round ${roundChunk.sequence}...`);
      const round = await extractRound(roundChunk);
      rounds.push(round);
    } catch (err: any) {
      console.warn(`[Pipeline] Round ${roundChunk.sequence} LLM failed, using programmatic only:`, err.message);
      // Fallback: use what we have programmatically
      rounds.push({
        sequence: roundChunk.sequence,
        name: `Round ${roundChunk.sequence}`,
        original_name: roundChunk.detected_name,
        type: roundChunk.detected_type,
        date: roundChunk.detected_date,
        mode: roundChunk.detected_mode,
        platform: roundChunk.detected_platform,
        duration: roundChunk.detected_duration,
        difficulty: roundChunk.detected_difficulty,
        description: roundChunk.raw.substring(0, 500),
        raw_content: roundChunk.raw,
        questions: [],
        coding: { problem_count: null, problems: [] },
        shortlisting: {},
        sections: [],
      });
    }
  }

  // ── Stage 3c: Extract tips ──
  let tips: string[] = [];
  let conclusion: string | null = null;
  try {
    const tipsResult = await extractTips(chunks.tips_chunk, chunks.result_chunk);
    tips = tipsResult.tips;
    conclusion = tipsResult.conclusion;
  } catch (err: any) {
    console.warn(`[Pipeline] Tips extraction failed:`, err.message);
    if (chunks.tips_chunk) tips = [chunks.tips_chunk];
  }

  // ── Stage 4: Assemble final Experience ──
  const outcome = chunks.programmatic.outcome_status
    ? {
        status: chunks.programmatic.outcome_status,
        selected_count: chunks.programmatic.selected_count,
        total_candidates: chunks.programmatic.total_candidates,
      }
    : { status: "unknown" };

  const assembled: any = {
    candidate: {
      name: header.candidate_name,
      department: header.department,
      degree: header.degree,
      college: header.college,
    },
    company: {
      name: header.company_name,
      normalized_name: header.company_name?.toLowerCase().replace(/\s*(ltd|pvt|inc|limited|private|corporation|corp|technologies|tech)\.?\s*/gi, "").trim() || null,
    },
    job: {
      role: header.role,
      employment_type: header.employment_type,
    },
    compensation: {
      ctc: chunks.programmatic.ctc,
    },
    rounds,
    outcome,
    tips,
    conclusion,
    raw_text: rawText,
  };

  // Run through existing validation + cleaning pipeline
  const validated = parseExtractionResult(assembled, rawText, filename);
  validated.source = {
    ...validated.source,
    file_name: filename,
    page_count: pageCount,
  };

  const cleaned = cleanExtractedExperience(validated) as Experience;
  const { redactObject } = await import("@/lib/quality-clean");

  const sections = [
    {
      type: "metadata" as const,
      title: "Verbatim Source Document",
      raw_content: redactObject(rawText),
    },
  ];

  return {
    dataset_metadata: {
      total_experiences: 1,
      total_rounds: cleaned.rounds.length,
    },
    experiences: [cleaned],
    ui_document: {
      version: "1.0",
      source: {
        filename,
        page_count: pageCount,
        character_count: rawText.length,
        sha256: crypto.createHash("sha256").update(rawText).digest("hex"),
      },
      sections,
      integrity: {
        lossless: true,
        source_span_count: sections.length,
        assigned_source_span_count: sections.length,
      },
    },
  };
}
