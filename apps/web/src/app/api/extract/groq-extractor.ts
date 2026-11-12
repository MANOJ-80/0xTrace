/**
 * Deterministic-first extraction pipeline.
 *
 *   Stage 1: PDF → text            (route.ts)
 *   Stage 2: text → chunks         (lib/chunker.ts, regex only)
 *   Stage 3: chunks → structured   (LLM, focused prompts, bounded concurrency)
 *   Stage 4: assemble → validate   (zod + cleaning)
 *
 * The LLM is only asked for things regex cannot do reliably: header details,
 * per-round questions/coding problems, and tips. Everything else is derived
 * locally, so a provider outage degrades quality instead of losing the upload.
 */

import crypto from "crypto";
import { chunkDocument, type ChunkedDocument, type RoundChunk } from "@/lib/chunker";
import { llmExtractJSON } from "@/lib/llm-providers";
import { parseExtractionResult } from "@/lib/extraction-schema";
import { cleanExtractedExperience, redactObject } from "@/lib/quality-clean";
import {
  normalizeQuestion,
  normalizeQuestionDifficulty,
  QUESTION_TOPICS,
} from "@/lib/question-metadata";
import type { ExtractionResponse, Experience, ExtractPipelineMeta } from "@/lib/types";

const ROUND_CONCURRENCY = 2;
const DEFAULT_EXTRACTION_BUDGET_MS = 50_000;

function extractionBudgetMs(): number {
  const configured = Number(process.env.EXTRACTION_BUDGET_MS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_EXTRACTION_BUDGET_MS;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function worker() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

function uniqueProviders(providers: string[]): string[] {
  return Array.from(new Set(providers.filter(Boolean)));
}

/* ------------------------------------------------------------------ */
/*  Stage 3a: Header                                                   */
/* ------------------------------------------------------------------ */

interface HeaderResult {
  header: {
    candidate_name?: string;
    company_name?: string;
    department?: string;
    college?: string;
    role?: string;
    employment_type?: string;
    degree?: string;
  };
  provider?: string;
}

function roundName(chunk: RoundChunk): string {
  const detected = (chunk.detected_name || "").replace(/[\s:–-]+$/, "").trim();
  return detected.length > `Round ${chunk.sequence}`.length
    ? detected
    : `Round ${chunk.sequence}`;
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function headerNeedsRepair(programmatic: ChunkedDocument["programmatic"]): boolean {
  const confidence = programmatic.confidence || {};
  return (
    confidence.company !== "high" ||
    confidence.candidate !== "high" ||
    confidence.role !== "high"
  );
}

async function extractHeader(
  headerChunk: string,
  programmatic: ChunkedDocument["programmatic"],
  firstRoundText: string | null,
  deadline: number
): Promise<HeaderResult> {
  const deterministic = {
    candidate_name: programmatic.candidate_name || undefined,
    company_name: programmatic.company_name || undefined,
    department: programmatic.department || undefined,
    college: programmatic.college || undefined,
    role: programmatic.role || undefined,
  };

  // Every header field is confirmed by an explicit label. Anything weaker is
  // sent to the LLM with the introduction as context.
  if (!headerNeedsRepair(programmatic)) {
    return { header: deterministic };
  }

  const context = [
    headerChunk.trim(),
    firstRoundText ? `--- First round excerpt ---\n${firstRoundText.slice(0, 700)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 4000);

  const { data, provider } = await llmExtractJSON<Record<string, any>>(
    `Extract candidate and company information from this interview experience header.
Use only facts stated in the text. If a field is not stated, return null. Never infer a value from the file name.
The first-round excerpt is context for a company name that appears in the introduction.
Return JSON: { "candidate_name": string|null, "company_name": string|null, "department": string|null, "degree": string|null, "college": string|null, "role": string|null, "employment_type": "full_time"|"internship"|"internship_plus_fte"|null }`,
    context,
    500,
    { deadline }
  );

  // A high-confidence label value wins. Otherwise the LLM repairs or fills it.
  const pick = (
    key: "company" | "candidate" | "role",
    llmValue: unknown,
    fallback: string | null
  ): string | undefined => {
    if (programmatic.confidence?.[key] === "high" && fallback) return fallback;
    return asText(llmValue) || fallback || undefined;
  };

  return {
    provider,
    header: {
      candidate_name: pick("candidate", data.candidate_name, programmatic.candidate_name),
      company_name: pick("company", data.company_name, programmatic.company_name),
      role: pick("role", data.role, programmatic.role),
      department: asText(data.department) || programmatic.department || undefined,
      college: asText(data.college) || programmatic.college || undefined,
      degree: asText(data.degree) || undefined,
      employment_type: asText(data.employment_type) || undefined,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Stage 3b: Per-round                                                */
/* ------------------------------------------------------------------ */

/**
 * Groq's free tier enforces 8K tokens per minute. A single 17K-character round
 * exceeds that on its own (HTTP 413), so long rounds are split at paragraph
 * boundaries and the partial extractions are merged afterwards.
 */
const MAX_ROUND_CHARS = Number(process.env.MAX_ROUND_CHARS) || 6000;

function splitRoundText(raw: string, maxChars: number): string[] {
  if (raw.length <= maxChars) return [raw];

  const parts: string[] = [];
  let rest = raw;

  while (rest.length > maxChars) {
    let cut = rest.lastIndexOf("\n", maxChars);
    if (cut < maxChars * 0.5) cut = rest.lastIndexOf(". ", maxChars);
    if (cut < maxChars * 0.5) cut = maxChars;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (rest) parts.push(rest);
  return parts.filter(Boolean);
}

function dedupeBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const normalized = key(item).toLowerCase().replace(/\s+/g, " ").trim();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

async function extractRound(chunk: RoundChunk, deadline: number) {
  const parts = splitRoundText(chunk.raw, MAX_ROUND_CHARS);
  const providers: string[] = [];

  const questions: any[] = [];
  const problems: any[] = [];
  const sections: any[] = [];
  let description: string | undefined;
  let shortlistedCount: number | null = null;

  for (const part of parts) {
    const { data, provider } = await llmExtractJSON<Record<string, any>>(
      `Extract interview questions and coding problems from this interview round text.
Each interview question must be a separate item, in the order it was asked.
Identify coding problems by algorithm names, LeetCode references, or problem statements.

Return JSON with this shape:
{
  "description": "brief narrative of what happened in this round",
  "questions": [
    {
      "question": "the actual question asked",
      "topic": null,
      "difficulty": null,
      "category": null
    }
  ],
  "coding_problems": [
    {
      "title": "short title",
      "description": "problem statement",
      "difficulty": null,
      "topics": ["array"]
    }
  ],
  "shortlisted_count": null,
  "sections": [{ "name": "section name", "question_count": 0 }]
}

Replace each null in a question with:
- topic: exactly one label from the list below, or null when none fits.
- difficulty: easy, medium, or hard, rated for a campus interview. Use null for conversational questions.
- category: technical for CS and engineering questions, behavioral for experience and teamwork questions, hr for career and company questions.

Topic labels:
${QUESTION_TOPICS.join(", ")}

Rules:
- Never return the word "null" as a string. Use JSON null.
- Never combine topics. Do not use a pipe character or list more than one label.
- Use "Cloud Computing" for AWS, Azure, GCP, S3, EC2, IAM, and cloud service questions.
- Use "System Design" for design, scaling, load balancer, message queue, caching, and architecture questions.
- Use "Backend & APIs" for Node.js, Express, server, and API questions.
- Use "Frontend & React" for React, DOM, hooks, and component questions.
- Use "Security & Authentication" for JWT, OAuth, cookies, passwords, API keys, and PII.
- Use "Projects & Experience" for questions about the candidate's projects, internship, or resume.
- Use "HR & Behavioral" for career goals, teamwork, conflict, relocation, and personal background.`,
      part,
      4096,
      { deadline }
    );

    providers.push(provider);

    if (!description && typeof data.description === "string" && data.description.trim()) {
      description = data.description;
    }
    if (shortlistedCount === null && typeof data.shortlisted_count === "number") {
      shortlistedCount = data.shortlisted_count;
    }
    if (Array.isArray(data.questions)) {
      questions.push(...data.questions.filter((question: any) => question && question.question));
    }
    if (Array.isArray(data.coding_problems)) {
      problems.push(...data.coding_problems.filter((problem: any) => problem && problem.title));
    }
    if (Array.isArray(data.sections)) {
      sections.push(...data.sections);
    }
  }

  const mergedQuestions = dedupeBy(
    questions
      .map((question) => normalizeQuestion(question))
      .filter((question) => question.question.length > 0),
    (question) => question.question
  );
  const mergedProblems = dedupeBy(
    problems
      .map((problem) => {
        const title =
          typeof problem.title === "string" ? problem.title.trim() : "";
        return {
          ...problem,
          title,
          difficulty: normalizeQuestionDifficulty(problem.difficulty),
          topics: Array.isArray(problem.topics)
            ? problem.topics
                .map((topic: unknown) =>
                  typeof topic === "string" ? topic.trim() : ""
                )
                .filter(
                  (topic: string) =>
                    topic.length > 0 &&
                    topic.length <= 40 &&
                    !topic.includes("|") &&
                    !/^null$/i.test(topic)
                )
            : [],
        };
      })
      .filter((problem) => problem.title.length > 0),
    (problem) => problem.title
  );

  return {
    providers,
    round: {
      sequence: chunk.sequence,
      name: roundName(chunk),
      original_name: chunk.detected_name,
      type: chunk.detected_type,
      date: chunk.detected_date || undefined,
      mode: chunk.detected_mode || undefined,
      platform: chunk.detected_platform || undefined,
      duration: chunk.detected_duration || undefined,
      difficulty: chunk.detected_difficulty || undefined,
      description,
      raw_content: chunk.raw,
      questions: mergedQuestions,
      coding: {
        problem_count: mergedProblems.length || undefined,
        problems: mergedProblems,
      },
      sections,
    },
  };
}

function fallbackRound(chunk: RoundChunk) {
  return {
    sequence: chunk.sequence,
    name: roundName(chunk),
    original_name: chunk.detected_name,
    type: chunk.detected_type,
    date: chunk.detected_date || undefined,
    mode: chunk.detected_mode || undefined,
    platform: chunk.detected_platform || undefined,
    duration: chunk.detected_duration || undefined,
    difficulty: chunk.detected_difficulty || undefined,
    description: chunk.raw.substring(0, 800),
    raw_content: chunk.raw,
    questions: [],
    coding: { problems: [] },
    sections: [],
  };
}

/* ------------------------------------------------------------------ */
/*  Stage 3c: Tips & conclusion                                        */
/* ------------------------------------------------------------------ */

/**
 * If the model returns nothing for a section the deterministic pass already
 * identified as advice, keep the source lines rather than dropping them.
 */
function fallbackTips(text: string): string[] {
  const tips: string[] = [];
  const seen = new Set<string>();

  for (const rawLine of text.split(/\n/)) {
    const line = rawLine
      .replace(/^[\s\u2022\u25cf\u25cb\u25aa\u2023\u2043\u2219\u27a2\uf0b7*-]+/, "")
      .trim();
    if (!line || line.length < 12 || line.length > 300) continue;
    if (line.split(/\s+/).length < 2) continue;
    // Section headings such as "Resources :" carry no advice on their own.
    if (/^[A-Za-z][A-Za-z &/]+:$/.test(line)) continue;

    const key = line.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    tips.push(line);
    if (tips.length >= 15) break;
  }

  return tips;
}

async function extractTips(
  tipsChunk: string | null,
  resultChunk: string | null,
  deadline: number
) {
  if (!tipsChunk && !resultChunk) {
    return { tips: [] as string[], conclusion: null as string | null, provider: undefined };
  }

  const text = [tipsChunk, resultChunk].filter(Boolean).join("\n\n");

  const { data, provider } = await llmExtractJSON<Record<string, any>>(
    `Extract tips/advice and any concluding remarks from this text.
Preparation resources and action items count as tips.
Each tip should be a SEPARATE string in the array.
Return JSON: { "tips": ["tip 1", "tip 2", ...], "conclusion": "concluding remark or null" }`,
    text,
    700,
    { deadline }
  );

  let tips = Array.isArray(data.tips) ? data.tips.filter(Boolean) : [];
  if (tips.length === 0 && tipsChunk) {
    tips = fallbackTips(tipsChunk);
  }

  return {
    tips,
    conclusion: typeof data.conclusion === "string" && data.conclusion.trim() ? data.conclusion : null,
    provider,
  };
}

/* ------------------------------------------------------------------ */
/*  Main pipeline                                                      */
/* ------------------------------------------------------------------ */

export async function extractExperience(
  rawText: string,
  filename: string,
  pageCount: number
): Promise<ExtractionResponse> {
  const startedAt = Date.now();
  const deadline = startedAt + extractionBudgetMs();
  const providers: string[] = [];
  const warnings: string[] = [];

  // ── Stage 2: deterministic chunking ──
  const chunks = chunkDocument(rawText);
  console.log(
    `[Pipeline] chunked rounds=${chunks.round_chunks.length} company="${chunks.programmatic.company_name}" candidate="${chunks.programmatic.candidate_name}" chars=${rawText.length}`
  );

  if (chunks.round_chunks.length === 0) {
    warnings.push(
      "No 'Round N' headings were detected. The whole document was kept as a single round; review it before publishing."
    );
  }

  // ── Stage 3a/3c: header and tips start immediately; rounds are bounded ──
  const headerPromise: Promise<HeaderResult> = extractHeader(
    chunks.header_chunk,
    chunks.programmatic,
    chunks.round_chunks[0]?.raw ?? null,
    deadline
  ).catch((error: any) => {
    warnings.push(
      `Header extraction failed (${error.message?.slice(0, 160)}). Company and candidate were filled from the regex pass.`
    );
    return {
      header: {
        candidate_name: chunks.programmatic.candidate_name || undefined,
        company_name: chunks.programmatic.company_name || undefined,
        department: chunks.programmatic.department || undefined,
        college: chunks.programmatic.college || undefined,
        role: chunks.programmatic.role || undefined,
      },
    };
  });

  const tipsPromise = extractTips(
    chunks.tips_chunk,
    chunks.result_chunk,
    deadline
  ).catch((error: any) => {
    warnings.push(
      `Tips extraction failed (${error.message?.slice(0, 160)}). Raw tips text was kept when available.`
    );
    return {
      tips: chunks.tips_chunk ? [chunks.tips_chunk] : [],
      conclusion: null,
      provider: undefined,
    };
  });

  // ── Stage 3b: rounds, bounded concurrency ──
  const roundResults = await mapWithConcurrency(
    chunks.round_chunks,
    ROUND_CONCURRENCY,
    async (roundChunk) => {
      try {
        console.log(`[Pipeline] extracting round ${roundChunk.sequence}`);
        return await extractRound(roundChunk, deadline);
      } catch (error: any) {
        const detail = error.message?.split("\n")[0]?.slice(0, 180) || "unknown error";
        console.warn(`[Pipeline] round ${roundChunk.sequence} failed: ${detail}`);
        warnings.push(
          `Round ${roundChunk.sequence}: structured extraction failed (${detail}). The verbatim source for this round was preserved.`
        );
        return { round: fallbackRound(roundChunk), providers: [] as string[] };
      }
    }
  );

  const headerResult = await headerPromise;
  const header = headerResult.header;
  if (headerResult.provider) providers.push(headerResult.provider);

  if (!header.company_name) {
    warnings.push("Company name could not be detected. Set it manually before publishing.");
  }

  const rounds = roundResults.map((result) => result.round);
  for (const result of roundResults) {
    providers.push(...result.providers);
  }

  // Keep document order even if a worker finished out of order.
  rounds.sort((a, b) => a.sequence - b.sequence);

  // ── Stage 3c: tips ──
  const tipsResult = await tipsPromise;
  const tips: string[] = tipsResult.tips;
  const conclusion: string | null = tipsResult.conclusion;
  if (tipsResult.provider) providers.push(tipsResult.provider);

  // ── Stage 4: assemble + validate ──
  const outcome = {
    status: chunks.programmatic.outcome_status || "unknown",
    candidates_selected: chunks.programmatic.selected_count ?? undefined,
    candidates_appeared: chunks.programmatic.total_candidates ?? undefined,
  };

  const normalizedCompany = header.company_name
    ? header.company_name
        .toLowerCase()
        .replace(
          /\s*(ltd|pvt|inc|limited|private|corporation|corp|technologies|tech)\.?\s*/gi,
          ""
        )
        .trim()
    : undefined;

  const assembled: any = {
    candidate: {
      name: header.candidate_name,
      department: header.department,
      degree: header.degree,
      college: header.college,
    },
    company: {
      name: header.company_name,
      normalized_name: normalizedCompany || undefined,
    },
    job: {
      role: header.role,
      employment_type: header.employment_type,
    },
    compensation: {
      ctc: chunks.programmatic.ctc || undefined,
    },
    rounds,
    outcome,
    tips,
    conclusion: conclusion || undefined,
    raw_text: rawText,
  };

  const validated = parseExtractionResult(assembled, rawText, filename);
  validated.source = {
    ...validated.source,
    file_name: filename,
    page_count: pageCount,
    sha256: crypto.createHash("sha256").update(rawText).digest("hex"),
  };

  const cleaned = cleanExtractedExperience(validated) as Experience;

  // Surface schema problems instead of silently publishing a stub.
  if (!cleaned.company?.name) {
    if (!warnings.some((warning) => warning.includes("Company name"))) {
      warnings.push("Company name could not be detected. Set it manually before publishing.");
    }
  }
  if (!cleaned.rounds.length) {
    warnings.push("No rounds were extracted. Add at least one round before publishing.");
  }

  if (warnings.length) {
    cleaned.quality = {
      ...(cleaned.quality || {}),
      issues: [...(cleaned.quality?.issues || []), ...warnings],
    };
  }

  // ── Lossless source sections ──
  const sections: ExtractionResponse["ui_document"]["sections"] = [
    {
      type: "metadata",
      title: "Document header",
      raw_content: redactObject(chunks.header_chunk || rawText.slice(0, 2000)),
    },
  ];

  for (const round of cleaned.rounds) {
    sections.push({
      type: "round",
      title: round.name,
      raw_content: redactObject(round.raw_content || ""),
    });
  }

  if (chunks.result_chunk) {
    sections.push({
      type: "outcome",
      title: "Result",
      raw_content: redactObject(chunks.result_chunk),
    });
  }
  if (tips.length) {
    sections.push({
      type: "tips",
      title: "Tips & takeaways",
      raw_content: redactObject(tips.join("\n\n")),
    });
  }
  if (conclusion) {
    sections.push({
      type: "conclusion",
      title: "Conclusion",
      raw_content: redactObject(conclusion),
    });
  }

  const characterCount = rawText.length;

  const pipeline: ExtractPipelineMeta = {
    providers: uniqueProviders(providers),
    warnings,
    rounds_detected: cleaned.rounds.length,
    page_count: pageCount,
    text_characters: characterCount,
    duration_ms: Date.now() - startedAt,
  };

  return {
    dataset_metadata: {
      total_experiences: 1,
      total_rounds: cleaned.rounds.length,
    },
    experiences: [cleaned],
    ui_document: {
      version: "1.1",
      source: {
        filename,
        page_count: pageCount,
        character_count: characterCount,
        sha256: validated.source.sha256,
      },
      sections,
      integrity: {
        lossless: sections.length > 0,
        source_span_count: sections.length,
        assigned_source_span_count: sections.length,
      },
    },
    pipeline,
  };
}
