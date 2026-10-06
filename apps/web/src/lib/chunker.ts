/**
 * Deterministic regex/heuristic chunker for campus placement interview PDFs.
 * Splits raw text into semantic sections and extracts metadata programmatically.
 * Zero LLM cost — this runs entirely on regex patterns.
 */

export interface RoundChunk {
  raw: string;
  detected_name: string;
  detected_type: string;
  detected_date: string | null;
  detected_mode: string | null;
  detected_platform: string | null;
  detected_duration: string | null;
  detected_difficulty: string | null;
  sequence: number;
}

export interface ChunkedDocument {
  header_chunk: string;
  round_chunks: RoundChunk[];
  result_chunk: string | null;
  tips_chunk: string | null;
  programmatic: {
    company_name: string | null;
    candidate_name: string | null;
    department: string | null;
    college: string | null;
    ctc: string | null;
    outcome_status: string | null;
    selected_count: number | null;
    total_candidates: number | null;
    round_count: number;
  };
}

/* ------------------------------------------------------------------ */
/*  Round Type Detection                                               */
/* ------------------------------------------------------------------ */

const ROUND_TYPE_PATTERNS: [RegExp, string][] = [
  [/online\s*(test|assessment|round|coding)/i, "online_assessment"],
  [/aptitude/i, "aptitude"],
  [/coding\s*(test|round|challenge)/i, "coding_test"],
  [/technical\s*(interview|round|discussion)/i, "technical_interview"],
  [/managerial\s*(interview|round)/i, "managerial_interview"],
  [/\bhr\b/i, "hr_interview"],
  [/behavioral/i, "behavioral_interview"],
  [/group\s*discussion/i, "group_discussion"],
  [/mcq/i, "mcq"],
  [/final\s*(interview|round)/i, "final_interview"],
  [/system\s*design/i, "system_design"],
  [/hackathon/i, "hackathon"],
];

function detectRoundType(text: string): string {
  const lower = text.toLowerCase();
  for (const [pattern, type] of ROUND_TYPE_PATTERNS) {
    if (pattern.test(lower)) return type;
  }
  // Fallback heuristics based on content
  if (/interview/i.test(lower)) return "technical_interview";
  if (/test|exam/i.test(lower)) return "online_assessment";
  return "unknown";
}

/* ------------------------------------------------------------------ */
/*  Metadata Extraction Patterns                                       */
/* ------------------------------------------------------------------ */

function extractDate(text: string): string | null {
  // Patterns: (22.07.2025), 22/07/2025, 22-07-2025, July 22 2025
  const patterns = [
    /\((\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})\)/,
    /(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})/,
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{4})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractMetaField(text: string, field: string): string | null {
  const re = new RegExp(`${field}\\s*[:–-]\\s*(.+)`, "im");
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function extractCTC(text: string): string | null {
  const patterns = [
    /(?:CTC|Package|Salary|Stipend)\s*[:–-]?\s*([\d.,]+\s*(?:LPA|lpa|Lakhs?|L))/i,
    /([\d.,]+\s*(?:LPA|lpa))/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

function extractOutcome(text: string): { status: string | null; selected: number | null; total: number | null } {
  const result = { status: null as string | null, selected: null as number | null, total: null as number | null };

  // "11 students were selected", "selected 11 students"
  const selMatch = text.match(/(\d+)\s*(?:students?|people|candidates?)\s*(?:were|got)?\s*selected/i)
    || text.match(/selected\s*(?:were|:)?\s*(\d+)/i);
  if (selMatch) {
    result.selected = parseInt(selMatch[1], 10);
    result.status = "selected";
  }

  // "I got selected", "I was selected"
  if (/(?:I|i)\s*(?:got|was|am)\s*selected/i.test(text)) {
    result.status = "selected";
  }
  if (/(?:I|i)\s*(?:got|was)\s*(?:not\s+)?rejected/i.test(text)) {
    result.status = "rejected";
  }

  // "out of 24", "from 24 students"
  const totalMatch = text.match(/(?:out\s+of|from)\s+(\d+)\s*(?:students?|people|candidates?)/i);
  if (totalMatch) {
    result.total = parseInt(totalMatch[1], 10);
  }

  return result;
}

function extractCompanyName(headerText: string): string | null {
  // Usually the first non-empty line is the company name
  const lines = headerText.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  // Skip common prefixes
  for (const line of lines) {
    if (/interview\s*experience/i.test(line)) continue;
    if (/placement\s*experience/i.test(line)) continue;
    if (/^[-–—]/.test(line)) continue; // candidate name line like "-Candidate K"
    if (line.length < 2) continue;
    // This is likely the company name
    return line.replace(/^[^a-zA-Z]+/, "").trim();
  }
  return lines[0];
}

function extractCandidateName(headerText: string): string | null {
  const lines = headerText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Look for patterns: "-Name", "– Name", "Name (Roll No)", "By: Name"
  for (const line of lines) {
    // "-Candidate K"
    const dashMatch = line.match(/^[-–—]\s*(.+)/);
    if (dashMatch && dashMatch[1].length > 2 && !/round|interview|experience/i.test(dashMatch[1])) {
      return dashMatch[1].trim();
    }
    // "By: Name" or "Author: Name"
    const byMatch = line.match(/(?:by|author|name)\s*[:–-]\s*(.+)/i);
    if (byMatch) return byMatch[1].trim();
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Main Chunker                                                       */
/* ------------------------------------------------------------------ */

/**
 * Split raw interview text into semantic chunks.
 * Returns structured chunks + programmatically extracted metadata.
 */
export function chunkDocument(rawText: string): ChunkedDocument {
  const text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 1. Find round boundaries
  // Patterns: "Round 1:", "Round 1 -", "Round 1 :-", "ROUND 1", "Round 1 – Online Test"
  const roundPattern = /^(?:Round\s*(\d+)\s*[:–\-]*\s*(.*?)$)/gim;
  const roundMatches: { index: number; number: number; title: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = roundPattern.exec(text)) !== null) {
    roundMatches.push({
      index: match.index,
      number: parseInt(match[1], 10),
      title: match[0].trim(),
    });
  }

  // 2. Split into header + rounds + tail
  let headerEnd = roundMatches.length > 0 ? roundMatches[0].index : text.length;
  const headerChunk = text.substring(0, headerEnd).trim();

  const roundChunks: RoundChunk[] = [];
  for (let i = 0; i < roundMatches.length; i++) {
    const start = roundMatches[i].index;
    const end = i + 1 < roundMatches.length ? roundMatches[i + 1].index : text.length;
    const raw = text.substring(start, end).trim();

    roundChunks.push({
      raw,
      detected_name: roundMatches[i].title,
      detected_type: detectRoundType(roundMatches[i].title + "\n" + raw.substring(0, 200)),
      detected_date: extractDate(roundMatches[i].title),
      detected_mode: extractMetaField(raw, "Mode"),
      detected_platform: extractMetaField(raw, "Platform"),
      detected_duration: extractMetaField(raw, "Duration"),
      detected_difficulty: extractMetaField(raw, "Difficulty(?:\\s*level)?"),
      sequence: i + 1,
    });
  }

  // 3. Find tips/takeaway section (usually at the very end)
  let tipsChunk: string | null = null;
  let resultChunk: string | null = null;

  // Check the tail after the last round
  if (roundChunks.length > 0) {
    const lastRound = roundChunks[roundChunks.length - 1];
    const tipsPatterns = [
      /(?:^|\n)((?:Takeaway|Tips|Note|Advice|Suggestions|Key\s*Points?|Things?\s*to\s*(?:remember|keep|note))s?\s*[:–\-]?\s*\n[\s\S]+)/im,
    ];

    for (const tp of tipsPatterns) {
      const tipsMatch = lastRound.raw.match(tp);
      if (tipsMatch) {
        tipsChunk = tipsMatch[1].trim();
        // Remove tips from the last round's raw content
        lastRound.raw = lastRound.raw.replace(tipsMatch[0], "").trim();
        break;
      }
    }

    // Extract result info from last round
    const resultPatterns = [
      /((?:The\s+)?results?\s+(?:was|were|is|came|announced)[\s\S]{10,200})/i,
      /(\d+\s+(?:students?|people|candidates?)\s+(?:were|got)\s+selected[\s\S]{0,200})/i,
    ];
    for (const rp of resultPatterns) {
      const resultMatch = lastRound.raw.match(rp);
      if (resultMatch) {
        resultChunk = resultMatch[1].trim();
        break;
      }
    }
  }

  // 4. Programmatic metadata extraction
  const fullText = text;
  const outcome = extractOutcome(fullText);

  const programmatic = {
    company_name: extractCompanyName(headerChunk),
    candidate_name: extractCandidateName(headerChunk),
    department: extractMetaField(headerChunk, "Department|Dept|Branch"),
    college: extractMetaField(headerChunk, "College|University|Institute"),
    ctc: extractCTC(fullText),
    outcome_status: outcome.status,
    selected_count: outcome.selected,
    total_candidates: outcome.total,
    round_count: roundChunks.length,
  };

  return {
    header_chunk: headerChunk,
    round_chunks: roundChunks,
    result_chunk: resultChunk,
    tips_chunk: tipsChunk,
    programmatic,
  };
}
