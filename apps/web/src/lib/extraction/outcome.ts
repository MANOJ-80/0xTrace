import type { DocLine } from "./text-lines";

export interface Outcome {
  status: string | null;
  selected: number | null;
  total: number | null;
}

const ADVICE_HEADING =
  /\b(?:takeaways?|tips?|advice|suggestions?|lessons?|things?\s+to\s+(?:remember|keep|note)|what\s+i\s+learned|final\s+notes?|closing\s+(?:notes?|thoughts?)|parting\s+notes?|note\s+for)\b/i;

const RESOURCE_HEADING = /^(?:resources?|references?|further\s+reading)\b/i;
const PREPARATION_HEADING = /^(?:preparation|preparing)\b/i;

const RESULT_HEADING =
  /^(?:the\s+)?(?:final\s+)?(?:verdict|veredict|results?|outcome|selection|final\s+selection)\b/i;

export function isAdviceHeading(text: string): boolean {
  const value = text.trim().replace(/[:.\s]+$/g, "");
  if (!value || value.length > 80) return false;
  if (/^[\u2022\u25cf\u25cb\u25aa\u2023\u2043\u2219\u27a2\uf0b7]/.test(value)) return false;
  if (value.split(/\s+/).length > 10) return false;
  // An inline `Note:- ...` inside a round is not a section heading.
  if (/^note\b/i.test(value)) return false;
  if (RESOURCE_HEADING.test(value) || PREPARATION_HEADING.test(value)) return true;
  return ADVICE_HEADING.test(value.slice(0, 48));
}

export function isResultHeading(text: string): boolean {
  const value = text.trim().replace(/[:.\s]+$/g, "");
  if (!value || value.length > 60) return false;
  if (/^[\u2022\u25cf\u25cb\u25aa\u2023\u2043\u2219\u27a2\uf0b7]/.test(value)) return false;
  if (value.split(/\s+/).length > 7) return false;
  if (/\s[-–—]\s|,\s/.test(value)) return false;
  return RESULT_HEADING.test(value);
}

function normaliseSentence(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Join wrapped lines back into sentences. A PDF line break can split
 * "were / selected" or a sentence across several lines, so sentence detection
 * waits for terminal punctuation or a paragraph break.
 */
function buildSentences(lines: DocLine[]): string[] {
  const sentences: string[] = [];
  let buffer = "";

  const flush = () => {
    if (!buffer.trim()) {
      buffer = "";
      return;
    }
    for (const part of buffer.split(/(?<=[.!?])\s+/)) {
      const value = normaliseSentence(part);
      if (value) sentences.push(value);
    }
    buffer = "";
  };

  for (const line of lines) {
    const text = normaliseSentence(line.text);
    if (!text) {
      flush();
      continue;
    }
    buffer = buffer ? `${buffer} ${text}` : text;
    if (/[.!?][”"’')\]]?$/.test(text) || buffer.length > 400) flush();
  }
  flush();
  return sentences;
}

function isAdviceSentence(sentence: string): boolean {
  return (
    /\brejected\s+by\s+(?:\w+\s+){0,3}companies\b/i.test(sentence) ||
    /\bcompanies?\s+rejected\s+you\b/i.test(sentence) ||
    /\brejections?\s+(?:will|sting|are)\b/i.test(sentence) ||
    /\bif\s+you\s+get\s+rejected\b/i.test(sentence) ||
    /\bdon'?t\s+need\s+to\s+be\s+perfect\b/i.test(sentence) ||
    /\bbefore\s+landing\s+a\s+final\s+offer\b/i.test(sentence) ||
    /\b(?:asked|question|why\s+i\s+thought|previous\s+interview)\b/i.test(sentence)
  );
}

/**
 * A sentence that says someone was selected "for the online assessment" or
 * "for the next round" describes a shortlist, not the final result.
 */
const ROUND_QUALIFIER =
  /\bselected\s+(?:for|to|in)\s+(?:the\s+|a\s+|an\s+)?(?:next\s+|final\s+|direct\s+)?(?:online|oa\b|assessment|test|technical|managerial|hr\b|interview|group\s+discussion|gd\b|round|shortlist|second|third|fourth|fifth)/i;

const COUNT_TOKEN =
  "\\d{1,4}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty";

const NOUN = "(?:students?|candidates?|people|members?|applicants?)";

const WORD_NUMBERS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

function parseCount(raw: string): number | null {
  const digits = raw.match(/\d+/);
  if (digits) {
    const value = parseInt(digits[0], 10);
    return Number.isFinite(value) ? value : null;
  }
  const word = raw.toLowerCase().trim();
  return WORD_NUMBERS[word] ?? null;
}

interface CountMatch {
  selected: number;
  total: number | null;
}

/** Read a final-selection count out of one sentence. */
function countFromSentence(sentence: string): CountMatch | null {
  const selectedWord = new RegExp(
    `(${COUNT_TOKEN})\\s+${NOUN}\\s+(?:from\\s+[^.]{0,70}?\\s+)?(?:were|got|have\\s+been|was|are)\\s+(?:finally\\s+|eventually\\s+)?selected`,
    "i"
  );

  const allMatch = new RegExp(
    `\\ball\\s+(?:the\\s+)?(${COUNT_TOKEN})\\s+${NOUN}[^.]{0,60}?\\bselected`,
    "i"
  ).exec(sentence);
  if (allMatch) {
    const selected = parseCount(allMatch[1]);
    return selected === null ? null : { selected, total: selected };
  }

  const pairMatch = new RegExp(
    `(${COUNT_TOKEN})\\s+(?:out\\s+of|of)\\s+(?:the\\s+)?(${COUNT_TOKEN})\\s+${NOUN}[^.]{0,90}?\\bselected`,
    "i"
  ).exec(sentence);
  if (pairMatch) {
    const selected = parseCount(pairMatch[1]);
    const total = parseCount(pairMatch[2]);
    return selected === null ? null : { selected, total };
  }

  // "a total of 8 students were selected" states the final number explicitly.
  const totalOf = new RegExp(
    `\\btotal\\s+of\\s+(${COUNT_TOKEN})(?:\\s+${NOUN})?[^.]{0,60}?\\bselected`,
    "i"
  ).exec(sentence);
  if (totalOf) {
    const selected = parseCount(totalOf[1]);
    if (selected !== null) return { selected, total: null };
  }

  // "5 candidates from PSG Tech and 2 candidates from PSG iTech were selected".
  // Only counts close to "selected" belong to the same clause; this keeps an
  // earlier "5 members completed the rounds" out of the total.
  const groups = [...sentence.matchAll(new RegExp(`(${COUNT_TOKEN})\\s+${NOUN}`, "gi"))]
    .map((match) => ({
      value: parseCount(match[1]),
      end: (match.index ?? 0) + match[0].length,
    }))
    .filter((group): group is { value: number; end: number } => group.value !== null);
  const selectedIndex = sentence.search(/\bselected\b/i);
  if (groups.length >= 2 && selectedIndex >= 0) {
    const near = groups.filter((group) => selectedIndex - group.end <= 80);
    if (near.length >= 2) {
      return { selected: near.reduce((sum, group) => sum + group.value, 0), total: null };
    }
  }

  const single = selectedWord.exec(sentence);
  if (single) {
    const selected = parseCount(single[1]);
    return selected === null ? null : { selected, total: null };
  }

  return null;
}

export function extractOutcome(lines: DocLine[], _adviceStart: number): Outcome {
  const result: Outcome = { status: null, selected: null, total: null };

  // Tips sections contain sentences like "I got rejected by 3 companies",
  // so they are filtered per sentence rather than dropped wholesale.
  const sentences = buildSentences(lines);

  let lastCount: CountMatch | null = null;

  for (const sentence of sentences) {
    if (isAdviceSentence(sentence)) continue;

    const negative =
      /\b(?:was|were|got|been)\s+(?:not\s+)?(?:rejected|not\s+selected)\b/i.test(sentence) ||
      /\bdid\s+not\s+get\s+selected\b/i.test(sentence) ||
      /\bwasn'?t\s+selected\b/i.test(sentence) ||
      /\b(?:verdict|result|outcome)\s*[:\-–—]\s*(?:not\s+selected|rejected)\b/i.test(sentence);

    if (negative) {
      result.status = "rejected";
      continue;
    }

    if (/\bnot\s+(?:been\s+)?selected\b/i.test(sentence)) continue;

    const positive =
      /\b(?:was|were|got|been|is|am|had\s+been)\s+(?:eventually\s+|finally\s+|also\s+|informed\s+that\s+(?:i\s+)?(?:had\s+been\s+)?)?(?:selected|hired)\b/i.test(
        sentence
      ) ||
      /\bselected\s+for\s+(?:the|a|this)\b/i.test(sentence) ||
      /\b(?:received|got|secured?)\s+(?:an?\s+|the\s+)?offer(?:s)?\b/i.test(sentence) ||
      /\b(?:was|got)\s+placed\b/i.test(sentence) ||
      /\b(?:verdict|result|outcome|final\s+result)\s*[:\-–—]\s*(?:selected|offer)\b/i.test(sentence);

    if (positive) {
      result.status = "selected";
    }

    if (ROUND_QUALIFIER.test(sentence)) continue;
    const count = countFromSentence(sentence);
    if (count) lastCount = count;
  }

  if (lastCount) {
    result.selected = lastCount.selected;
    if (lastCount.total !== null) result.total = lastCount.total;
  }

  if (result.total === null) {
    const text = sentences.join("\n");
    const totalMatch =
      text.match(
        new RegExp(
          `(?:out\\s+of|from)\\s+(${COUNT_TOKEN})\\s+${NOUN}`,
          "i"
        )
      ) ||
      text.match(
        new RegExp(`(${COUNT_TOKEN})\\s+${NOUN}\\s+(?:attended|appeared|applied)`, "i")
      );
    if (totalMatch) {
      const total = parseCount(totalMatch[1]);
      if (total !== null) result.total = total;
    }
  }

  return result;
}
