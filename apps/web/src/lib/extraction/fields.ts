import { collapse, stripBullet, type DocLine } from "./text-lines";

export type FieldConfidence = "high" | "medium" | "low";

export interface FieldValue {
  value: string | null;
  confidence: FieldConfidence;
}

export type HeaderKey =
  | "name"
  | "company"
  | "role"
  | "department"
  | "college"
  | "degree"
  | "ctc"
  | "stipend"
  | "location"
  | "month"
  | "date"
  | "employmentType";

export interface ParsedHeader {
  name: FieldValue;
  company: FieldValue;
  role: FieldValue;
  department: FieldValue;
  college: FieldValue;
  degree: FieldValue;
  ctc: FieldValue;
  stipend: FieldValue;
  location: FieldValue;
  month: FieldValue;
  date: FieldValue;
  employmentType: FieldValue;
}

const EMPTY: FieldValue = { value: null, confidence: "low" };

const FIELD_ALIASES: Record<string, HeaderKey> = {
  name: "name",
  "candidate name": "name",
  candidate: "name",
  "full name": "name",
  "student name": "name",
  company: "company",
  "company name": "company",
  organization: "company",
  organisation: "company",
  employer: "company",
  firm: "company",
  role: "role",
  position: "role",
  designation: "role",
  "job role": "role",
  profile: "role",
  "job profile": "role",
  dept: "department",
  department: "department",
  branch: "department",
  discipline: "department",
  stream: "department",
  college: "college",
  university: "college",
  institute: "college",
  institution: "college",
  degree: "degree",
  course: "degree",
  program: "degree",
  programme: "degree",
  ctc: "ctc",
  "ctc offered": "ctc",
  "total ctc": "ctc",
  package: "ctc",
  salary: "ctc",
  compensation: "ctc",
  "compensation offered": "ctc",
  stipend: "stipend",
  "internship stipend": "stipend",
  "monthly stipend": "stipend",
  location: "location",
  city: "location",
  "base location": "location",
  "job location": "location",
  month: "month",
  "month visited": "month",
  "hiring process window": "month",
  period: "month",
  date: "date",
  dates: "date",
  "interview date": "date",
  type: "employmentType",
  offer: "employmentType",
  "employment type": "employmentType",
  "job type": "employmentType",
};

const SECTION_WORDS =
  /\b(?:interview|experience|eligibility|compensation|recruitment|selection|process|round|resume|contact|phone|email|linkedin|roadmap|timeline|overview|summary|preparation|tips|takeaway|advice|conclusion|verdict|result)\b/i;

const MONTH_WORD =
  /^(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;

function normaliseLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[.:\u2013\u2014-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const ALIAS_ENTRIES = Object.entries(FIELD_ALIASES).sort(
  (a, b) => b[0].length - a[0].length
);

function escapePattern(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Resolve a label to a canonical field.
 *
 * Exact aliases win. Otherwise, a label may carry qualifiers such as
 * `CTC Offered (UG)` or `Total CTC`; match the last alias that appears as a
 * whole word so the most specific part of a compound label wins.
 */
function canonicalKey(label: string): HeaderKey | null {
  const clean = normaliseLabel(label);
  if (!clean) return null;
  const exact = FIELD_ALIASES[clean];
  if (exact) return exact;

  let best: { key: HeaderKey; position: number } | null = null;
  for (const [alias, key] of ALIAS_ENTRIES) {
    const pattern = new RegExp(`(?:^|\\s)${escapePattern(alias)}(?:\\s|$)`);
    const match = pattern.exec(clean);
    if (!match) continue;
    const position = match.index + match[0].length;
    if (!best || position > best.position) best = { key, position };
  }

  return best?.key ?? null;
}

function validLabel(label: string): boolean {
  const clean = normaliseLabel(label);
  if (clean.length < 2 || clean.length > 40) return false;
  if (!/^[a-z][a-z0-9 ./&()'-]*$/.test(clean)) return false;
  if (clean.split(" ").length > 4) return false;
  return true;
}

export interface LabelledValue {
  key: HeaderKey | null;
  label: string;
  value: string;
}

/**
 * Parse a line shaped like `Label: value` or `Label    value`, including files
 * that put several labels on one line (`Role: X Package: Y`).
 */
export function parseLabelledLine(text: string): LabelledValue[] {
  const trimmed = text.trim();
  if (!trimmed || /^[\u2022\u25cf\u25cb\u25aa\u2023\u2043\u2219\u27a2\uf0b7]/.test(trimmed)) return [];
  if (/^round\b/i.test(trimmed)) return [];

  const colonIndex = trimmed.search(/[:：]/);
  const spaceIndex = trimmed.search(/\s{2,}/);

  let separator = -1;
  let separatorLength = 0;
  if (colonIndex >= 0 && (spaceIndex < 0 || colonIndex <= spaceIndex)) {
    separator = colonIndex;
    separatorLength = 1;
  } else if (spaceIndex >= 0) {
    separator = spaceIndex;
    separatorLength = trimmed.slice(spaceIndex).match(/^\s+/)?.[0].length || 0;
  } else {
    // Headers also separate with a dash: `Package- 15.78 LPA`, `Role - SDE`.
    // Only accept it when the left side is a recognised field label.
    const dashed = trimmed.match(/^(.{2,32}?)\s*[-–—]\s+(.+)$/);
    if (dashed && canonicalKey(dashed[1])) {
      separator = dashed[1].length;
      separatorLength = trimmed.slice(separator).match(/^\s*[-–—]\s+/)?.[0].length || 0;
    }
  }
  if (separator < 0) return [];

  const label = trimmed.slice(0, separator).trim();
  if (!validLabel(label)) return [];

  let value = trimmed.slice(separator + separatorLength).trim();
  value = stripBullet(value.replace(/^[-–—:]\s*/, "")).trim();
  if (!value) return [];

  // Several labels can share a line when the PDF uses a two-column layout.
  // A label may also be split across fragments (`Total CTC Offered(UG)`), so
  // fragments without a colon are merged with the label that follows them.
  const rawParts = value.split(/\s+(?=[A-Z][A-Za-z0-9 ./&()'’+-]{1,24}\s*:)/);
  const fields: LabelledValue[] = [
    { key: canonicalKey(label), label: label.trim(), value: collapse(rawParts[0]) },
  ];

  let buffer = "";
  for (const part of rawParts.slice(1)) {
    if (!part.includes(":")) {
      buffer = buffer ? `${buffer} ${part}` : part;
      continue;
    }
    const candidate = buffer ? `${buffer} ${part}` : part;
    buffer = "";
    const match = candidate.match(/^([^:]{1,48}):\s*(.+)$/);
    if (!match) continue;
    fields.push({
      key: canonicalKey(match[1]),
      label: match[1].trim(),
      value: collapse(match[2]),
    });
  }

  return fields.filter((field) => field.value);
}

function stripParenthetical(value: string): string {
  return value
    .replace(
      /\s*\([^)]*(?:https?:\/\/|www\.|\.com\b|\.in\b|\.org\b|\.net\b|\.io\b)[^)]*\)\s*$/i,
      ""
    )
    .replace(
      /\s*\([^)]*(?:intern|fte|full[\s-]?time|package|ctc|lpa|salary|stipend)[^)]*\)\s*$/i,
      ""
    )
    .replace(/\s*\([^)]{45,}\)\s*$/, "")
    .trim();
}

export function sanitizeCompany(value: string | null): string | null {
  if (!value) return null;
  const company = stripParenthetical(
    collapse(value.replace(/^[\s\-–—:|]+/, "").replace(/[\s\-–—:|]+$/, ""))
  );
  if (company.length < 2 || company.length > 80) return null;
  if (/@|https?:\/\/|www\./i.test(company)) return null;
  if (MONTH_WORD.test(company) && /\d{4}/.test(company)) return null;
  if (SECTION_WORDS.test(company) && !/\b(?:ltd|limited|inc|corp|technologies|systems|bank)\b/i.test(company)) {
    return null;
  }
  if (/^(?:month|role|position|designation|location|ctc|package|salary|stipend|date|time|candidate|name|college|university|institute|department|dept|branch|degree|eligibility|drive)\b/i.test(company)) {
    return null;
  }
  return company;
}

export function sanitizePerson(value: string | null): string | null {
  if (!value) return null;
  const person = collapse(value.replace(/^[\s\-–—:|]+/, "").replace(/[\s\-–—:|]+$/, ""));
  if (person.length < 2 || person.length > 60) return null;
  if (!/^[A-Za-z][A-Za-z .'’\-]*$/.test(person)) return null;
  if (person.split(" ").length > 6) return null;
  if (SECTION_WORDS.test(person)) return null;
  return person;
}

export function sanitizeRole(value: string | null): string | null {
  if (!value) return null;
  const role = collapse(value.replace(/^[\s\-–—:|]+/, "").trim());
  if (role.length < 2 || role.length > 90) return null;
  if (/@|https?:\/\//i.test(role)) return null;
  // A compensation value is not a role, but titles such as "CTC Risk Analyst"
  // are legitimate, so only reject unmistakable pay strings.
  if (/^[₹$€£]?\s*\d[\d.,]*\s*(?:k|kgs?|lpa|lakhs?|per\s+annum|per\s+month|pm)?$/i.test(role)) {
    return null;
  }
  if (/\b(?:lpa|lakhs?\s+per\s+annum|per\s+month|stipend)\b/i.test(role)) return null;
  if (SECTION_WORDS.test(role) && role.split(" ").length > 8) return null;
  return role;
}

export function sanitizeCtc(value: string | null): string | null {
  if (!value) return null;
  const ctc = collapse(value);
  if (ctc.length < 2 || ctc.length > 60) return null;
  if (!/\d/.test(ctc)) return null;
  if (/@|https?:\/\//i.test(ctc)) return null;
  return ctc;
}

function field(key: HeaderKey, value: string | null, confidence: FieldConfidence): FieldValue {
  return { value, confidence: value ? confidence : "low" };
}

interface Banner {
  company: string | null;
  lineIndex: number;
}

function findBanner(lines: DocLine[]): Banner | null {
  for (const line of lines) {
    const flat = collapse(line.text);
    if (!flat) continue;

    const drive = flat.match(/^(?:placement|hiring)\s+drive\s*[-–—:]\s*(.+)$/i);
    if (drive) {
      const company = sanitizeCompany(drive[1]);
      if (company) return { company, lineIndex: line.index };
    }

    const titled = flat.match(
      /^(.{2,90}?)\s*(?:[-–—|:]\s*)?(?:interview|placement)\s*experience\b/i
    );
    if (titled) {
      const company = sanitizeCompany(titled[1]);
      if (company) return { company, lineIndex: line.index };
    }
  }
  return null;
}

export function parseHeader(lines: DocLine[]): ParsedHeader {
  const fields: ParsedHeader = {
    name: { ...EMPTY },
    company: { ...EMPTY },
    role: { ...EMPTY },
    department: { ...EMPTY },
    college: { ...EMPTY },
    degree: { ...EMPTY },
    ctc: { ...EMPTY },
    stipend: { ...EMPTY },
    location: { ...EMPTY },
    month: { ...EMPTY },
    date: { ...EMPTY },
    employmentType: { ...EMPTY },
  };

  const assign = (key: HeaderKey | null, rawValue: string) => {
    if (!key || fields[key].confidence !== "low") return;
    let value: string | null = rawValue;
    if (key === "company") value = sanitizeCompany(rawValue);
    else if (key === "name") value = sanitizePerson(rawValue);
    else if (key === "role") value = sanitizeRole(rawValue);
    else if (key === "ctc") value = sanitizeCtc(rawValue);
    else value = collapse(rawValue);

    if (value) fields[key] = field(key, value, "high");
  };

  for (const line of lines) {
    for (const parsed of parseLabelledLine(line.text)) {
      assign(parsed.key, parsed.value);
    }
  }

  const banner = findBanner(lines);
  if (banner?.company && fields.company.confidence === "low") {
    fields.company = field("company", banner.company, "medium");
  }

  // A candidate name often sits directly below the title, with no label.
  if (fields.name.confidence === "low" && banner) {
    const start = lines.findIndex((line) => line.index === banner.lineIndex);
    for (let offset = 1; offset <= 2 && start + offset < lines.length; offset++) {
      const person = sanitizePerson(lines[start + offset].text);
      if (person) {
        fields.name = field("name", person, "medium");
        break;
      }
    }
  }

  return fields;
}
