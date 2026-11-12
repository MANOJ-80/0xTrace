import type { Experience } from "./types";

/**
 * Fill a target record from a duplicate source.
 *
 * The target keeps its identity and any value it already has. Source values
 * only fill empty fields. String list fields are unioned so tips and notes from
 * both records survive; round arrays stay with the target to avoid duplicating
 * the same interview.
 */

const PROTECTED_KEYS = new Set(["_id", "id", "created_at"]);
const UNION_ARRAY_KEYS = new Set(["additional_information", "tips", "mistakes"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}

function mergeValue(current: unknown, incoming: unknown, key: string): unknown {
  if (isEmpty(current)) return incoming;

  if (isPlainObject(current) && isPlainObject(incoming)) {
    const merged: Record<string, unknown> = { ...current };
    for (const [childKey, childValue] of Object.entries(incoming)) {
      merged[childKey] = mergeValue(merged[childKey], childValue, childKey);
    }
    return merged;
  }

  if (Array.isArray(current) && Array.isArray(incoming)) {
    if (UNION_ARRAY_KEYS.has(key)) {
      const seen = new Set(current.map((item) => JSON.stringify(item)));
      const merged = [...current];
      for (const item of incoming) {
        const marker = JSON.stringify(item);
        if (!seen.has(marker)) {
          merged.push(item);
          seen.add(marker);
        }
      }
      return merged;
    }
    return current;
  }

  return current;
}

export function mergeExperienceDocuments(
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> {
  const merged: Record<string, any> = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (PROTECTED_KEYS.has(key)) continue;
    merged[key] = mergeValue(merged[key], value, key);
  }

  const notes = Array.isArray(merged.additional_information)
    ? merged.additional_information
    : [];
  const sourceLabel = source.id || String(source._id || "unknown");
  merged.additional_information = [
    ...notes,
    `Merged duplicate record ${sourceLabel} into this entry.`,
  ];

  merged.updated_at = new Date().toISOString();
  return merged;
}

export function sameCompanyAndCandidate(
  a: Experience,
  b: Experience
): boolean {
  const company = (experience: Experience) =>
    String(experience.company?.name || experience.company?.normalized_name || "")
      .trim()
      .toLowerCase();
  const candidate = (experience: Experience) =>
    String(experience.candidate?.name || "").trim().toLowerCase();

  return (
    company(a) !== "" &&
    candidate(a) !== "" &&
    company(a) === company(b) &&
    candidate(a) === candidate(b)
  );
}
