import { getCollection } from "./mongodb";
import { isAdminEmail } from "./admins";

/**
 * Account directory for the admin panel.
 *
 * Sign-in is JWT based, so NextAuth does not create a user row. These helpers
 * record one document per college account on sign-in and keep a throttled
 * `last_seen_at` value so the admin panel can show recent activity.
 *
 * Every write is best-effort: tracking must never block sign-in.
 */

const LAST_SEEN_WRITE_MS = 15 * 60 * 1000;

export type AdminUserSort = "active" | "newest" | "name";

export interface AdminUserRow {
  email: string;
  name: string | null;
  image: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  last_sign_in_at: string | null;
  sign_in_count: number;
  submissions: number;
  is_admin: boolean;
}

export interface AdminUserStats {
  total: number;
  active15m: number;
  new7d: number;
  contributors: number;
}

export interface AdminUserListResult {
  users: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: AdminUserStats;
}

export interface AdminUserExperience {
  _id: string;
  id: string | null;
  company: string | null;
  role: string | null;
  outcome: string | null;
  moderation_status: string | null;
  created_at: string | null;
}

export interface AdminUserActivity {
  _id: string;
  action: string;
  target_company: string | null;
  target_candidate: string | null;
  created_at: string;
}

export interface AdminUserDetail {
  user: AdminUserRow | null;
  experiences: AdminUserExperience[];
  activity: AdminUserActivity[];
}

let userIndexPromise: Promise<unknown> | null = null;

async function usersCollection() {
  const col = await getCollection("users");
  if (!userIndexPromise) {
    userIndexPromise = col
      .createIndex({ email: 1 }, { unique: true })
      .catch((error) => console.error("[users] failed to create email index", error));
  }
  await userIndexPromise;
  return col;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function shouldTouchLastSeen(lastSeenAt?: number | null): boolean {
  return !lastSeenAt || Date.now() - lastSeenAt > LAST_SEEN_WRITE_MS;
}

export async function recordUserSignIn(user: {
  email?: string | null;
  name?: string | null;
  image?: string | null;
}): Promise<void> {
  const email = user.email?.trim().toLowerCase();
  if (!email) return;

  try {
    const now = new Date().toISOString();
    const col = await usersCollection();
    await col.updateOne(
      { email },
      {
        $set: {
          name: user.name ?? null,
          image: user.image ?? null,
          last_seen_at: now,
          last_sign_in_at: now,
        },
        $setOnInsert: { first_seen_at: now },
        $inc: { sign_in_count: 1 },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("[users] failed to record sign-in", error);
  }
}

export async function touchUser(email: string): Promise<void> {
  try {
    const col = await usersCollection();
    await col.updateOne(
      { email: email.trim().toLowerCase() },
      { $set: { last_seen_at: new Date().toISOString() } }
    );
  } catch (error) {
    console.error("[users] failed to update last seen", error);
  }
}

async function submissionCountsByEmail(): Promise<{ email: string; count: number }[]> {
  const experiences = await getCollection("experiences");
  const rows = await experiences
    .aggregate([
      { $match: { "author.email": { $type: "string", $ne: "" } } },
      { $group: { _id: { $toLower: "$author.email" }, count: { $sum: 1 } } },
    ])
    .toArray();

  return rows.map((row) => ({ email: String(row._id), count: Number(row.count) }));
}

function toUserRow(
  doc: Record<string, any>,
  counts: Map<string, number>
): AdminUserRow {
  const email = String(doc.email || "");
  return {
    email,
    name: doc.name ? String(doc.name) : null,
    image: doc.image ? String(doc.image) : null,
    first_seen_at: doc.first_seen_at || null,
    last_seen_at: doc.last_seen_at || null,
    last_sign_in_at: doc.last_sign_in_at || null,
    sign_in_count: Number(doc.sign_in_count || 0),
    submissions: counts.get(email.toLowerCase()) ?? 0,
    is_admin: isAdminEmail(email),
  };
}

export async function getAdminUsers(params: {
  q?: string;
  sort?: AdminUserSort;
  page?: number;
  limit?: number;
}): Promise<AdminUserListResult> {
  const page = Math.max(1, Math.floor(params.page || 1));
  const limit = Math.min(100, Math.max(10, Math.floor(params.limit || 25)));
  const q = (params.q || "").trim();

  const filter: Record<string, unknown> = {};
  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ email: pattern }, { name: pattern }];
  }

  const sort: Record<string, 1 | -1> =
    params.sort === "newest"
      ? { first_seen_at: -1 }
      : params.sort === "name"
        ? { name: 1 }
        : { last_seen_at: -1 };

  const sortStage: Record<string, unknown>[] =
    params.sort === "name"
      ? [
          {
            $addFields: {
              sort_name: { $toLower: { $ifNull: ["$name", "$email"] } },
            },
          },
          { $sort: { sort_name: 1 } },
        ]
      : [{ $sort: sort }];

  const col = await usersCollection();
  const experiences = await getCollection("experiences");
  const now = Date.now();
  const activeSince = new Date(now - LAST_SEEN_WRITE_MS).toISOString();
  const weekSince = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const docsPromise = col
    .aggregate([
      { $match: filter },
      ...sortStage,
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ])
    .toArray();

  const [total, docs, totalAccounts, active15m, new7d, counts, contributorEmails] =
    await Promise.all([
      col.countDocuments(filter),
      docsPromise,
      col.countDocuments({}),
      col.countDocuments({ last_seen_at: { $gte: activeSince } }),
      col.countDocuments({ first_seen_at: { $gte: weekSince } }),
      submissionCountsByEmail(),
      experiences.distinct("author.email", {
        "author.email": { $type: "string", $ne: "" },
      }),
    ]);

  const countMap = new Map(counts.map((row) => [row.email, row.count]));
  const contributors = new Set(
    contributorEmails.map((email) => String(email).toLowerCase())
  ).size;

  return {
    users: docs.map((doc) => toUserRow(doc, countMap)),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    stats: { total: totalAccounts, active15m, new7d, contributors },
  };
}

export async function getAdminUserDetail(rawEmail: string): Promise<AdminUserDetail> {
  const email = rawEmail.trim().toLowerCase();
  if (!email) {
    return { user: null, experiences: [], activity: [] };
  }

  const col = await usersCollection();
  const experiencesCol = await getCollection("experiences");
  const activityCol = await getCollection("activity_log");
  const emailPattern = new RegExp(`^${escapeRegex(email)}$`, "i");

  const [doc, experiences, activity, counts] = await Promise.all([
    col.findOne({ email }),
    experiencesCol
      .find(
        { "author.email": emailPattern },
        {
          projection: {
            _id: 1,
            id: 1,
            company: 1,
            job: 1,
            outcome: 1,
            moderation_status: 1,
            created_at: 1,
          },
        }
      )
      .sort({ created_at: -1 })
      .limit(25)
      .toArray(),
    activityCol
      .find({ actor_email: emailPattern })
      .sort({ created_at: -1 })
      .limit(10)
      .toArray(),
    submissionCountsByEmail(),
  ]);

  const countMap = new Map(counts.map((row) => [row.email, row.count]));

  return {
    user: doc ? toUserRow(doc, countMap) : null,
    experiences: experiences.map((row) => ({
      _id: row._id.toString(),
      id: row.id || null,
      company: row.company?.name || row.company?.normalized_name || null,
      role: row.job?.role || null,
      outcome: row.outcome?.status || null,
      moderation_status: row.moderation_status || null,
      created_at: row.created_at || null,
    })),
    activity: activity.map((row) => ({
      _id: row._id.toString(),
      action: String(row.action || ""),
      target_company: row.target_company || null,
      target_candidate: row.target_candidate || null,
      created_at: row.created_at || "",
    })),
  };
}

export async function getUsersForExport(): Promise<AdminUserRow[]> {
  const col = await usersCollection();
  const [docs, counts] = await Promise.all([
    col.find({}).sort({ last_seen_at: -1 }).toArray(),
    submissionCountsByEmail(),
  ]);
  const countMap = new Map(counts.map((row) => [row.email, row.count]));
  return docs.map((doc) => toUserRow(doc, countMap));
}
