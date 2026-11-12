/**
 * Per-user cap on PDF extraction runs.
 *
 * Extraction calls the LLM provider chain, so an authenticated account with no
 * published record could otherwise run it repeatedly at the project's expense.
 * Counters live in MongoDB so the limit holds across serverless instances and
 * deployments. Documents expire on their own through a TTL index.
 */

import type { Collection } from "mongodb";
import { getCollection } from "./mongodb";

const WINDOW_MS = 60 * 60 * 1000;
const WINDOW_GRACE_MS = WINDOW_MS * 2;
const DEFAULT_LIMIT = 5;

export interface ExtractionQuota {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

interface UsageDoc {
  _id: string;
  count: number;
  expires_at: Date;
}

function configuredLimit(): number {
  const raw = Number(process.env.EXTRACTION_HOURLY_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_LIMIT;
}

let indexPromise: Promise<void> | null = null;

function ensureIndex(collection: Collection<UsageDoc>): Promise<void> {
  if (!indexPromise) {
    indexPromise = collection
      .createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
      .then(() => undefined)
      .catch((error) => {
        indexPromise = null;
        throw error;
      });
  }
  return indexPromise;
}

function isDuplicateKey(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

/**
 * Count one extraction attempt against the caller's current hourly window.
 *
 * The conditional update is atomic: the counter only increments while it is
 * below the limit. When the document already sits at the limit, the upsert
 * collides with the existing `_id` and returns a duplicate-key error, which
 * means the caller is over the limit.
 */
export async function consumeExtractionQuota(
  email: string,
  limit = configuredLimit()
): Promise<ExtractionQuota> {
  const normalized = email.trim().toLowerCase();
  const now = Date.now();
  const windowStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  const windowEnd = windowStart + WINDOW_MS;
  const retryAfterSeconds = Math.max(1, Math.ceil((windowEnd - now) / 1000));

  const collection = (await getCollection("extraction_usage")) as unknown as Collection<UsageDoc>;
  try {
    await ensureIndex(collection);
  } catch (error) {
    // The TTL index only cleans up old buckets; extraction should not fail
    // because index creation was denied.
    console.warn("[quota] could not create TTL index:", error);
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const updated = await collection.findOneAndUpdate(
        { _id: `${normalized}:${windowStart}`, count: { $lt: limit } },
        {
          $inc: { count: 1 },
          $setOnInsert: { expires_at: new Date(windowEnd + WINDOW_GRACE_MS) },
        },
        { upsert: true, returnDocument: "after" }
      );

      const count = Number(updated?.count ?? 1);
      return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - count),
        retryAfterSeconds,
      };
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
      // Either the bucket is at the limit, or two first requests raced to
      // insert it. The retry increments the winner's document if it has room
      // and collides again only when the limit is genuinely reached.
    }
  }

  return { allowed: false, limit, remaining: 0, retryAfterSeconds };
}
