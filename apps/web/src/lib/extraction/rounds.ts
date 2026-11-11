import { collapse, type DocLine } from "./text-lines";
import { parseLabelledLine } from "./fields";

export interface RoundHeading {
  index: number;
  number: number;
  title: string;
}

const WORD_ORDINALS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
};

const ROUND_TYPE_PATTERNS: [RegExp, string][] = [
  [/hackathon/i, "hackathon"],
  [/\b(?:gd|group\s+discussion)\b/i, "group_discussion"],
  [/\b(?:oa|online\s+assessment|online\s+test|online\s+round)\b/i, "online_assessment"],
  [/coding\s*(?:test|round|challenge|assessment)/i, "coding_test"],
  [/aptitude/i, "aptitude"],
  [/system\s*design/i, "system_design"],
  [/managerial\s*(?:interview|round)/i, "managerial_interview"],
  [/behaviou?ral/i, "behavioral_interview"],
  [/technical\s*(?:interview|round|discussion)/i, "technical_interview"],
  [/final\s*(?:interview|round)/i, "final_interview"],
  [/\bhr\b/i, "hr_interview"],
  [/\bmcq/i, "mcq"],
];

function cleanTitle(value: string): string {
  return collapse(value)
    .replace(/^[\s\-–—:.|]+/, "")
    .replace(/[\s\-–—:.|]+$/, "")
    .trim()
    .slice(0, 120);
}

/**
 * Recognise one round heading.
 *
 * Handles `Round 3: X`, `Round-1`, `Round - 1`, `1st Round`, and `SECOND ROUND`,
 * which covers the variants in the sample set and common templates.
 */
export function matchRoundHeading(text: string): { number: number; title: string } | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 160) return null;
  if (/^[\u2022\u25cf\u25cb\u25aa\u2023\u2043\u2219\u27a2\uf0b7]/.test(trimmed)) return null;
  if (/\?$/.test(trimmed)) return null;

  let number = 0;
  let rest = "";

  const prefixed = trimmed.match(
    /^round\s*[-–—:.]?\s*(\d{1,2})\b\s*(?:[-–—:.]\s*)?(.*)$/i
  );
  if (prefixed) {
    number = parseInt(prefixed[1], 10);
    rest = prefixed[2] || "";
  } else {
    const suffixed = trimmed.match(
      /^(\d{1,2})\s*(?:st|nd|rd|th)\s*round\b\s*[-–—:.]?\s*(.*)$/i
    );
    if (suffixed) {
      number = parseInt(suffixed[1], 10);
      rest = suffixed[2] || "";
    } else {
      const ordinal = trimmed.match(
        /^(first|second|third|fourth|fifth|sixth|seventh|eighth)\s+round\b\s*[-–—:.]?\s*(.*)$/i
      );
      if (ordinal) {
        number = WORD_ORDINALS[ordinal[1].toLowerCase()] || 0;
        rest = ordinal[2] || "";
      }
    }
  }

  if (!Number.isFinite(number) || number < 1 || number > 20) return null;

  const title = cleanTitle(rest);
  // A body reference such as "Round 4: around 300 students applied" starts
  // lowercase after the colon and is not a heading.
  if (title && /^[a-z]/.test(title)) return null;

  return { number, title };
}

export function detectRoundType(title: string, preview: string): string {
  const fromTitle = detectFromText(title);
  if (fromTitle !== "unknown") return fromTitle;

  // Prefer the opening sentence: later sentences often mention other rounds.
  const opening = preview.match(/^.{0,260}?[.!?](?:\s|$)/)?.[0] ?? preview.slice(0, 200);
  const fromOpening = detectFromText(opening);
  if (fromOpening !== "unknown") return fromOpening;

  return detectFromText(preview.slice(0, 400));
}

function detectFromText(value: string): string {
  const text = value.toLowerCase();
  for (const [pattern, type] of ROUND_TYPE_PATTERNS) {
    if (pattern.test(text)) return type;
  }
  if (/interview/i.test(text)) return "technical_interview";
  if (/test|exam/i.test(text)) return "online_assessment";
  return "unknown";
}

export function extractDate(value: string): string | null {
  const patterns = [
    /\((\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})\)/,
    /(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})/,
    /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2},?\s+\d{4})/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export interface RoundMeta {
  date: string | null;
  mode: string | null;
  platform: string | null;
  duration: string | null;
  difficulty: string | null;
  format: string | null;
}

export function extractRoundMeta(lines: DocLine[]): RoundMeta {
  const meta: RoundMeta = {
    date: null,
    mode: null,
    platform: null,
    duration: null,
    difficulty: null,
    format: null,
  };

  for (const line of lines.slice(0, 24)) {
    for (const parsed of parseLabelledLine(line.text)) {
      const label = parsed.label.toLowerCase();
      if (!meta.date && /\bdate\b|\bwhen\b/.test(label)) meta.date = parsed.value;
      if (!meta.mode && /\bmode\b/.test(label)) meta.mode = parsed.value;
      if (!meta.platform && /\bplatform\b/.test(label)) meta.platform = parsed.value;
      if (!meta.duration && /\bduration\b|\btime\b/.test(label)) meta.duration = parsed.value;
      if (!meta.difficulty && /\bdifficult/.test(label)) meta.difficulty = parsed.value;
      if (!meta.format && /\bformat\b/.test(label)) meta.format = parsed.value;
    }
  }

  return meta;
}
