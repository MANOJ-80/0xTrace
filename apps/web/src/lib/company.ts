/**
 * Canonical key for a company name.
 *
 * Records spell the same employer several ways ("IDFC FIRST Bank", "IDFC First
 * Bank", "IDFC First Bank Ltd."). The key removes case, accents, punctuation,
 * and trailing legal suffixes so those variants group together.
 */

const LEGAL_SUFFIXES = new Set([
  "pvt",
  "private",
  "ltd",
  "limited",
  "llp",
  "inc",
  "incorporated",
  "corp",
  "corporation",
  "co",
  "company",
  "llc",
  "gmbh",
  "plc",
  "pte",
]);

export function normalizeCompanyKey(name?: string | null): string {
  if (!name) return "";

  const tokens = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  while (tokens.length > 1 && LEGAL_SUFFIXES.has(tokens[tokens.length - 1])) {
    tokens.pop();
  }

  return tokens.join("_");
}

/**
 * Pick the spelling used most often for a normalized group. Ties keep the
 * first spelling seen, which is the order the caller supplies.
 */
export function mostCommonName(counts: Map<string, number>): string {
  let best = "";
  let bestCount = -1;
  for (const [name, count] of counts.entries()) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best || "Unknown";
}
