import type { Experience, ExperienceSummary, Round } from "./types";

/**
 * Public projections.
 *
 * The archive stores full candidate writeups, contact details, author email,
 * and raw source text. None of that belongs in a response that an anonymous
 * visitor can request. Summaries power the directory and list API; the full
 * document stays behind the author/admin check in `GET /api/experiences/[id]`.
 */

/** Reduce a name to a first name and last initial for public cards. */
export function publicCandidateName(name?: string | null): string | null {
  const trimmed = (name || "").trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];

  const lastInitial = parts[parts.length - 1][0]?.toUpperCase();
  return lastInitial ? `${parts[0]} ${lastInitial}.` : parts[0];
}

function roundQuestionCount(round: Round | Record<string, unknown>): number {
  const questions = (round as { questions?: unknown }).questions;
  return Array.isArray(questions) ? questions.length : 0;
}

function roundCodingCount(round: Round | Record<string, unknown>): number {
  const coding = (round as { coding?: { problems?: unknown } }).coding;
  return Array.isArray(coding?.problems) ? coding.problems.length : 0;
}

/**
 * Turn a stored record (or an aggregation row) into the anonymous shape.
 *
 * The function accepts already-computed counts so a MongoDB projection can
 * avoid loading the question arrays just to size them.
 */
export function toExperienceSummary(source: Record<string, any>): ExperienceSummary {
  const rounds: Round[] = Array.isArray(source.rounds) ? source.rounds : [];
  const roundSummaries = rounds.slice(0, 3).map((round) => ({
    name: round.name || "Interview round",
    type: round.type || "interview",
    questions: roundQuestionCount(round),
  }));

  const roundCount =
    typeof source.round_count === "number" ? source.round_count : rounds.length;
  const questionCount =
    typeof source.question_count === "number"
      ? source.question_count
      : rounds.reduce((total, round) => total + roundQuestionCount(round), 0);
  const codingCount =
    typeof source.coding_count === "number"
      ? source.coding_count
      : rounds.reduce((total, round) => total + roundCodingCount(round), 0);

  const displayName =
    source.candidate?.display_name ??
    publicCandidateName(source.candidate?.name ?? source.candidate_name);

  const roundNames = Array.isArray(source.round_names)
    ? source.round_names
    : rounds.map((round) => round.name);

  return {
    _id: String(source._id ?? source.id ?? ""),
    id: source.id || String(source._id ?? ""),
    company: source.company
      ? {
          name: source.company.name ?? null,
          normalized_name: source.company.normalized_name ?? null,
        }
      : null,
    candidate: {
      display_name: displayName,
      department: source.candidate?.department ?? source.department ?? null,
    },
    job: source.job ? { role: source.job.role ?? null } : null,
    timeline: source.timeline ? { year: source.timeline.year ?? null } : null,
    outcome: source.outcome ? { status: source.outcome.status ?? null } : null,
    round_count: roundCount,
    question_count: questionCount,
    coding_count: codingCount,
    rounds: roundSummaries,
    round_names: roundNames,
    moderation_status: source.moderation_status,
  };
}

export function toExperienceSummaries(
  experiences: Array<Record<string, any>>
): ExperienceSummary[] {
  return experiences.map(toExperienceSummary);
}

/**
 * Backwards-compatible public projection for a single record.
 *
 * Only `GET /api/experiences/[id]` used this for anonymous callers. It now
 * returns the summary, which is the only anonymous shape the app exposes.
 */
export function toPublicExperience(
  experience: Experience | Record<string, any>
): ExperienceSummary {
  return toExperienceSummary(experience as Record<string, any>);
}

export function toPublicExperiences(
  experiences: Array<Experience | Record<string, any>>
): ExperienceSummary[] {
  return experiences.map((experience) => toPublicExperience(experience));
}
