import { getCollection } from "./mongodb";

/**
 * Queries behind the admin panel.
 *
 * Public pages read every record and filter in memory. The admin table cannot
 * do that: it needs real pagination, sorting, and a payload without the full
 * writeup. These helpers keep the work in MongoDB and return only the columns
 * the table renders.
 */

export type AdminSort = "recent" | "oldest" | "company" | "candidate" | "quality";

export interface AdminListParams {
  q?: string;
  outcome?: string;
  quality?: "flagged" | "ok" | "";
  attention?: boolean;
  status?: "pending" | "published" | "rejected" | "";
  sort?: AdminSort;
  page?: number;
  limit?: number;
}

export interface AdminExperienceRow {
  _id: string;
  id: string;
  company: { name?: string | null; normalized_name?: string | null } | null;
  candidate: { name?: string | null; department?: string | null } | null;
  job: { role?: string | null } | null;
  outcome: { status?: string | null } | null;
  author: { email?: string | null; name?: string | null } | null;
  created_at?: string | null;
  updated_at?: string | null;
  quality: { score?: number | null; issues?: string[] | null } | null;
  source: { file_name?: string | null; experience_number?: number | null } | null;
  moderation_status?: "pending" | "published" | "rejected" | null;
  round_count: number;
  question_count: number;
}

export interface AdminListResult {
  experiences: AdminExperienceRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOverview {
  total: number;
  companies: number;
  last7Days: number;
  flagged: number;
  pending: number;
  missingRole: number;
  missingIdentity: number;
  attention: number;
  outcomes: { status: string; count: number }[];
  topCompanies: { name: string; count: number }[];
}

export interface DuplicateRecord {
  _id: string;
  id?: string | null;
  created_at?: string | null;
  role?: string | null;
  outcome?: string | null;
  quality?: number | null;
  author_email?: string | null;
  source_file?: string | null;
}

export interface DuplicateGroup {
  key: string;
  company: string;
  candidate: string;
  count: number;
  records: DuplicateRecord[];
}

export interface DuplicateResult {
  groups: DuplicateGroup[];
  totalGroups: number;
  totalRecords: number;
}

const ATTENTION_MATCH = {
  $or: [
    { "quality.issues.0": { $exists: true } },
    { "quality.score": { $lt: 60 } },
    { "job.role": { $in: [null, ""] } },
    { "company.name": { $in: [null, ""] } },
    { "candidate.name": { $in: [null, ""] } },
  ],
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter(params: AdminListParams): Record<string, unknown> {
  const filters: Record<string, unknown>[] = [];
  const q = params.q?.trim().slice(0, 100);

  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filters.push({
      $or: [
        { "company.name": pattern },
        { "candidate.name": pattern },
        { "job.role": pattern },
        { id: pattern },
        { "author.email": pattern },
      ],
    });
  }

  if (params.outcome) {
    filters.push({
      "outcome.status": { $regex: escapeRegex(params.outcome), $options: "i" },
    });
  }

  if (params.status) {
    filters.push(
      params.status === "published"
        ? {
            $or: [
              { moderation_status: "published" },
              { moderation_status: { $exists: false } },
            ],
          }
        : { moderation_status: params.status }
    );
  }

  if (params.attention) {
    filters.push(ATTENTION_MATCH);
  }

  if (params.quality === "flagged") {
    filters.push({
      $or: [
        { "quality.issues.0": { $exists: true } },
        { "quality.score": { $lt: 60 } },
      ],
    });
  } else if (params.quality === "ok") {
    filters.push({
      "quality.issues.0": { $exists: false },
      $or: [{ "quality.score": { $gte: 60 } }, { "quality.score": { $exists: false } }],
    });
  }

  return filters.length > 0 ? { $and: filters } : {};
}

function sortStage(sort: AdminSort): Record<string, 1 | -1> {
  switch (sort) {
    case "oldest":
      return { created_at: 1, _id: 1 };
    case "company":
      return { "company.name": 1, created_at: -1 };
    case "candidate":
      return { "candidate.name": 1, created_at: -1 };
    case "quality":
      // Missing scores sort first so records without a review surface at the top.
      return { "quality.score": 1, created_at: -1 };
    case "recent":
    default:
      return { created_at: -1, _id: -1 };
  }
}

const ROW_PROJECTION = {
  id: 1,
  company: 1,
  candidate: 1,
  job: 1,
  outcome: 1,
  author: 1,
  created_at: 1,
  updated_at: 1,
  quality: 1,
  source: 1,
  moderation_status: 1,
  round_count: { $size: { $ifNull: ["$rounds", []] } },
  question_count: {
    $sum: {
      $map: {
        input: { $ifNull: ["$rounds", []] },
        as: "round",
        in: { $size: { $ifNull: ["$$round.questions", []] } },
      },
    },
  },
};

export async function getAdminExperiences(params: AdminListParams): Promise<AdminListResult> {
  const page = Math.max(1, Math.floor(params.page || 1));
  const limit = Math.min(100, Math.max(10, Math.floor(params.limit || 25)));
  const sort = params.sort || "recent";
  const filter = buildFilter(params);

  const col = await getCollection("experiences");
  const [result] = await col
    .aggregate([
      { $match: filter },
      { $sort: sortStage(sort) },
      {
        $facet: {
          rows: [{ $skip: (page - 1) * limit }, { $limit: limit }, { $project: ROW_PROJECTION }],
          total: [{ $count: "value" }],
        },
      },
    ])
    .toArray();

  const total = result?.total?.[0]?.value ?? 0;
  const experiences = (result?.rows ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    _id: String(row._id),
  })) as AdminExperienceRow[];

  return {
    experiences,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const col = await getCollection("experiences");
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [result] = await col
    .aggregate([
      {
        $facet: {
          total: [{ $count: "value" }],
          companies: [
            { $match: { "company.name": { $nin: [null, ""] } } },
            { $group: { _id: "$company.name" } },
            { $count: "value" },
          ],
          last7Days: [{ $match: { created_at: { $gte: sevenDaysAgo } } }, { $count: "value" }],
          flagged: [
            {
              $match: {
                $or: [
                  { "quality.issues.0": { $exists: true } },
                  { "quality.score": { $lt: 60 } },
                ],
              },
            },
            { $count: "value" },
          ],
          pending: [
            { $match: { moderation_status: "pending" } },
            { $count: "value" },
          ],
          missingRole: [
            { $match: { "job.role": { $in: [null, ""] } } },
            { $count: "value" },
          ],
          missingIdentity: [
            {
              $match: {
                $or: [
                  { "company.name": { $in: [null, ""] } },
                  { "candidate.name": { $in: [null, ""] } },
                ],
              },
            },
            { $count: "value" },
          ],
          attention: [{ $match: ATTENTION_MATCH }, { $count: "value" }],
          outcomes: [
            { $group: { _id: { $ifNull: ["$outcome.status", "unknown"] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
          ],
          topCompanies: [
            { $match: { "company.name": { $nin: [null, ""] } } },
            { $group: { _id: "$company.name", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ])
    .toArray();

  const count = (stage?: { value?: number }[]) => stage?.[0]?.value ?? 0;

  return {
    total: count(result?.total),
    companies: count(result?.companies),
    last7Days: count(result?.last7Days),
    flagged: count(result?.flagged),
    pending: count(result?.pending),
    missingRole: count(result?.missingRole),
    missingIdentity: count(result?.missingIdentity),
    attention: count(result?.attention),
    outcomes: (result?.outcomes ?? []).map((row: { _id: string; count: number }) => ({
      status: row._id || "unknown",
      count: row.count,
    })),
    topCompanies: (result?.topCompanies ?? []).map((row: { _id: string; count: number }) => ({
      name: row._id || "Unknown",
      count: row.count,
    })),
  };
}

export async function findDuplicateGroups(limit = 200): Promise<DuplicateResult> {
  const col = await getCollection("experiences");
  const rows = await col
    .aggregate([
      {
        $match: {
          "company.name": { $nin: [null, ""] },
          "candidate.name": { $nin: [null, ""] },
        },
      },
      {
        $group: {
          // Case and surrounding whitespace should not hide a duplicate.
          _id: {
            company: { $toLower: { $trim: { input: "$company.name" } } },
            candidate: { $toLower: { $trim: { input: "$candidate.name" } } },
          },
          company: { $first: "$company.name" },
          candidate: { $first: "$candidate.name" },
          count: { $sum: 1 },
          records: {
            $push: {
              _id: { $toString: "$_id" },
              id: "$id",
              created_at: "$created_at",
              role: "$job.role",
              outcome: "$outcome.status",
              quality: "$quality.score",
              author_email: "$author.email",
              source_file: "$source.file_name",
            },
          },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1, "_id.company": 1, "_id.candidate": 1 } },
      { $limit: Math.min(500, Math.max(1, limit)) },
    ])
    .toArray();

  const groups = rows.map((row) => ({
    key: `${row._id.company}::${row._id.candidate}`,
    company: row.company || "Unknown",
    candidate: row.candidate || "Unknown",
    count: row.count,
    records: (row.records || []).sort((a: DuplicateRecord, b: DuplicateRecord) =>
      String(b.created_at || "").localeCompare(String(a.created_at || ""))
    ),
  })) as DuplicateGroup[];

  return {
    groups,
    totalGroups: groups.length,
    totalRecords: groups.reduce((sum, group) => sum + group.count, 0),
  };
}
