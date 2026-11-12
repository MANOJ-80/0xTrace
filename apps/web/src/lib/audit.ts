import { getCollection } from "./mongodb";

/**
 * Append-only record of who changed what.
 *
 * Writes are best-effort: an audit failure must never fail the edit or delete
 * that triggered it, so `recordActivity` swallows and logs errors.
 */

export type AuditAction = "create" | "update" | "delete" | "bulk_delete";

export interface AuditActor {
  email?: string | null;
  name?: string | null;
}

export interface AuditTarget {
  id?: string | null;
  company?: string | null;
  candidate?: string | null;
}

export interface ActivityRecord {
  _id: string;
  action: AuditAction;
  actor_email: string;
  actor_name: string | null;
  target_id: string | null;
  target_company: string | null;
  target_candidate: string | null;
  target_count: number;
  detail: string | null;
  created_at: string;
}

export interface ActivityResult {
  entries: ActivityRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function recordActivity(input: {
  action: AuditAction;
  actor: AuditActor;
  target?: AuditTarget;
  count?: number;
  detail?: string | null;
}): Promise<void> {
  try {
    const col = await getCollection("activity_log");
    await col.insertOne({
      action: input.action,
      actor_email: input.actor.email || "unknown",
      actor_name: input.actor.name || null,
      target_id: input.target?.id || null,
      target_company: input.target?.company || null,
      target_candidate: input.target?.candidate || null,
      target_count: input.count ?? 1,
      detail: input.detail || null,
      created_at: new Date().toISOString(),
    } as any);
  } catch (error) {
    console.error("[audit] failed to record activity", error);
  }
}

export async function getActivity(params: {
  page?: number;
  limit?: number;
  action?: string;
}): Promise<ActivityResult> {
  const page = Math.max(1, Math.floor(params.page || 1));
  const limit = Math.min(100, Math.max(10, Math.floor(params.limit || 25)));
  const filter = params.action ? { action: params.action } : {};

  const col = await getCollection("activity_log");
  const [entries, total] = await Promise.all([
    col
      .find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    col.countDocuments(filter),
  ]);

  return {
    entries: entries.map((entry) => ({
      ...entry,
      _id: entry._id.toString(),
    })) as unknown as ActivityRecord[],
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
