/**
 * Deterministic document chunker.
 *
 * The extractor preserves layout, so everything here works on lines: round
 * headings, labelled fields, sections, and result text. There are no
 * document-specific rules; ambiguous fields are marked low confidence and are
 * repaired by the LLM stage or the preview editor.
 */

import { collapse, joinLines, toLines, type DocLine } from "./extraction/text-lines";
import { parseHeader, type FieldConfidence, type ParsedHeader } from "./extraction/fields";
import {
  detectRoundType,
  extractDate,
  extractRoundMeta,
  matchRoundHeading,
} from "./extraction/rounds";
import { extractOutcome, isAdviceHeading, isResultHeading } from "./extraction/outcome";

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
    role: string | null;
    ctc: string | null;
    outcome_status: string | null;
    selected_count: number | null;
    total_candidates: number | null;
    round_count: number;
    confidence: Record<string, FieldConfidence>;
  };
}

interface Heading {
  index: number;
  number: number;
  title: string;
}

function findHeadings(lines: DocLine[]): Heading[] {
  const found: Heading[] = [];
  let lastNumber = 0;

  for (const line of lines) {
    const heading = matchRoundHeading(line.text);
    if (!heading) continue;
    // Ignore backward references such as a later "Round 1" summary.
    if (heading.number <= lastNumber) continue;
    lastNumber = heading.number;
    found.push({ index: line.index, number: heading.number, title: heading.title });
  }

  return found;
}

function headerConfidence(fields: ParsedHeader): Record<string, FieldConfidence> {
  return {
    company: fields.company.confidence,
    candidate: fields.name.confidence,
    role: fields.role.confidence,
    department: fields.department.confidence,
    college: fields.college.confidence,
    ctc: fields.ctc.confidence,
  };
}

function peekTitle(lines: DocLine[], start: number, end: number): string {
  for (let index = start + 1; index < Math.min(end, start + 4); index++) {
    const text = lines[index]?.text.trim();
    if (!text) continue;
    if (text.length > 60) return "";
    if (/^[a-z]/.test(text)) return "";
    if (/[:：]/.test(text) && /\s{2,}/.test(text)) return "";
    return collapse(text);
  }
  return "";
}

function findResultLine(lines: DocLine[], start: number, end: number): number {
  for (let index = start; index < end; index++) {
    if (isResultHeading(lines[index].text)) return index;
  }
  // No explicit heading: use the first line that states a result.
  for (let index = start; index < end; index++) {
    if (/\b(?:result|selected|rejected|offer|verdict)\b/i.test(lines[index].text)) {
      return index;
    }
  }
  return -1;
}

function firstSentence(raw: string): string {
  const text = raw.replace(/\s+/g, " ").trim();
  const cut = text.search(/[.!?]\s/);
  return (cut > 0 ? text.slice(0, cut) : text).slice(0, 240);
}

export function chunkDocument(rawText: string): ChunkedDocument {
  const lines = toLines(rawText);
  const headings = findHeadings(lines);

  const headerEnd = headings.length > 0 ? headings[0].index : Math.min(lines.length, 80);
  const headerLines = lines.slice(0, headerEnd);
  const fields = parseHeader(headerLines);

  const roundChunks: RoundChunk[] = [];

  if (headings.length === 0) {
    const raw = joinLines(lines);
    roundChunks.push({
      raw,
      detected_name: "Round 1",
      detected_type: detectRoundType("", firstSentence(raw)),
      detected_date: extractDate(raw.slice(0, 400)),
      detected_mode: null,
      detected_platform: null,
      detected_duration: null,
      detected_difficulty: null,
      sequence: 1,
    });
  } else {
    headings.forEach((heading, index) => {
      const start = heading.index;
      const end = index + 1 < headings.length ? headings[index + 1].index : lines.length;
      const roundLines = lines.slice(start, end);
      const raw = joinLines(roundLines);

      const title = heading.title || peekTitle(lines, start, end);
      const display = title ? `Round ${index + 1}: ${title}` : `Round ${index + 1}`;
      const meta = extractRoundMeta(roundLines);

      roundChunks.push({
        raw,
        detected_name: display,
        detected_type: detectRoundType(title, raw.slice(0, 400)),
        detected_date: extractDate(title) || meta.date,
        detected_mode: meta.mode,
        detected_platform: meta.platform,
        detected_duration: meta.duration,
        detected_difficulty: meta.difficulty,
        sequence: index + 1,
      });
    });
  }

  // Sections at the end of the document: result verdict and preparation advice.
  let tipsChunk: string | null = null;
  let resultChunk: string | null = null;
  let adviceStart = -1;

  if (headings.length > 0) {
    const lastStart = headings[headings.length - 1].index;
    const lastEnd = lines.length;

    const adviceIndices: number[] = [];
    const resultIndices: number[] = [];
    let contentLines = 0;
    for (let index = lastStart + 1; index < lastEnd; index++) {
      const text = lines[index].text;
      if (!text.trim()) continue;
      if (isResultHeading(text)) resultIndices.push(index);
      else if (isAdviceHeading(text) && contentLines >= 2) adviceIndices.push(index);
      contentLines++;
    }

    adviceStart = adviceIndices.length > 0 ? adviceIndices[0] : -1;
    const resultStart =
      resultIndices.length > 0
        ? resultIndices[0]
        : findResultLine(lines, lastStart, lastEnd);

    // The last round ends where its trailing result/tips sections begin.
    const cut = [adviceStart, resultStart]
      .filter((index) => index >= 0)
      .reduce((lowest, index) => Math.min(lowest, index), lastEnd);
    if (cut < lastEnd && roundChunks.length > 0) {
      const last = roundChunks[roundChunks.length - 1];
      last.raw = joinLines(lines.slice(lastStart, cut));
    }

    if (resultStart >= 0) {
      const stop = adviceIndices.find((index) => index > resultStart) ?? lastEnd;
      resultChunk = joinLines(lines.slice(resultStart, stop));
    }

    if (adviceStart >= 0) {
      const stop = resultIndices.find((index) => index > adviceStart) ?? lastEnd;
      tipsChunk = joinLines(lines.slice(adviceStart, stop));
    }
  }

  const outcome = extractOutcome(lines, adviceStart);

  const programmatic = {
    company_name: fields.company.value,
    candidate_name: fields.name.value,
    department: fields.department.value,
    college: fields.college.value,
    role: fields.role.value,
    ctc: fields.ctc.value,
    outcome_status: outcome.status,
    selected_count: outcome.selected,
    total_candidates: outcome.total,
    round_count: roundChunks.length,
    confidence: headerConfidence(fields),
  };

  return {
    header_chunk: joinLines(headerLines),
    round_chunks: roundChunks,
    result_chunk: resultChunk,
    tips_chunk: tipsChunk,
    programmatic,
  };
}
