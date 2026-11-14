/**
 * Remove contact details from submitted text before it can be published.
 *
 * Consent covers the submitter's permission, but a writeup can still contain
 * someone else's email address or phone number. Redaction keeps the rest of
 * the record intact and reports how many replacements were made.
 */

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_PATTERN =
  /(?:\+?91[\s-]?)?(?:[6-9]\d{9}|[6-9]\d{4}[\s-]\d{5}|[6-9]\d{2}[\s-]\d{3}[\s-]\d{4})\b/g;

export interface RedactionResult<T> {
  value: T;
  count: number;
}

const SKIP_KEYS = new Set(["sha256", "_id", "id", "created_at", "updated_at"]);

export function redactContactDetails<T>(input: T): RedactionResult<T> {
  let count = 0;

  const walk = (value: unknown): unknown => {
    if (typeof value === "string") {
      return value
        .replace(EMAIL_PATTERN, () => {
          count += 1;
          return "[email removed]";
        })
        .replace(PHONE_PATTERN, () => {
          count += 1;
          return "[phone removed]";
        });
    }

    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (value && typeof value === "object") {
      const next: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        next[key] = SKIP_KEYS.has(key) ? child : walk(child);
      }
      return next;
    }

    return value;
  };

  return { value: walk(input) as T, count };
}
