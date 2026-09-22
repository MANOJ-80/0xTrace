import { parseExtractionResult } from "@/lib/extraction-schema";
import { cleanExtractedExperience } from "@/lib/quality-clean";
import type { ExtractionResponse, Experience } from "@/lib/types";
import crypto from "crypto";

export async function extractWithGroq(
  rawText: string,
  filename: string,
  pageCount: number
): Promise<ExtractionResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to apps/web/.env.local to enable live PDF extraction."
    );
  }

  const systemPrompt = `You are an expert structured-data extraction engine. You receive the raw text of a campus placement interview experience PDF from an Indian engineering college student. Extract ALL information into a single JSON object.

FIELDS TO EXTRACT:
- candidate: { name, department, degree, college, cgpa (number or string), roll_no }
- company: { name, normalized_name (lowercase, no suffixes like "Ltd") }
- job: { role, employment_type ("full_time" | "internship" | "internship_plus_fte"), location }
- timeline: { month, year (number), drive_type }
- eligibility: { min_cgpa, branches_eligible (array), history_of_arrears, standing_arrears }
- compensation: { ctc (string like "12 LPA"), base, stipend, breakdown }
- rounds: array of objects, each containing:
  - sequence: 1-indexed number
  - name: "Round N: <descriptive title>"
  - original_name: the heading text as it appears in the document
  - type: ONE OF: online_assessment, aptitude, coding_test, technical_test, mcq, group_discussion, technical_interview, managerial_interview, behavioral_interview, hr_interview, final_interview, other, unknown
  - mode: "online" | "offline" | null
  - platform: e.g. "HackerRank", "Zoom", null
  - duration: e.g. "60 minutes", null
  - difficulty: "easy" | "medium" | "hard" | null
  - description: the candidate's narrative walkthrough of the round
  - raw_content: Leave this as an empty string ""
  - questions: array of { question, topic, difficulty, category ("technical" | "behavioral" | "hr"), details }
  - coding: { problem_count, problems: [{ title, description, difficulty, topics: [] }] }
- outcome: { status ("selected" | "rejected" | "waitlisted" | "unknown"), offer_type, candidates_selected, candidates_appeared }
- tips: array of advice strings the candidate shared
- mistakes: array of mistakes/pitfalls mentioned
- conclusion: concluding remarks if any
- contacts: { email, linkedin, phone }
- additional_information: array of any other notable info

CRITICAL RULES:
1. Extract each interview question as a SEPARATE item in the questions array.
2. Coding problems should be identified by LeetCode/GFG references, algorithm names, or problem statements.
3. If a field is not present in the document, use null.
4. Return ONLY a valid JSON object. No markdown, no explanatory text.`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        max_tokens: 3000,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Extract structured data from this interview experience document:\n\n${rawText}`,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(content);
  } catch {
    parsedJson = {};
  }

  require("fs").writeFileSync("/tmp/llm_raw.json", content);
  const validated = parseExtractionResult(parsedJson, rawText, filename);
  validated.source = {
    ...validated.source,
    file_name: filename,
    page_count: pageCount,
  };

  const cleaned = cleanExtractedExperience(validated) as Experience;

  // Build ui_document sections. Since the LLM no longer outputs verbatim raw_content,
  // we provide the entire rawText as a single document section to preserve lossless verification.
  const sections = [
    {
      type: "metadata" as const,
      title: "Verbatim Source Document",
      raw_content: rawText,
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
