import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Readiness probe for uptime monitoring.
 *
 * It reports whether the database answers and which required services are
 * configured. It never returns environment values.
 */
export async function GET() {
  const startedAt = Date.now();
  let database: "ok" | "error" = "ok";
  let databaseError: string | null = null;

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
  } catch (error) {
    database = "error";
    databaseError = error instanceof Error ? error.message : "Unknown database error";
  }

  const configured = {
    mongodb: Boolean(process.env.MONGODB_URI),
    nextauth_secret: Boolean(process.env.NEXTAUTH_SECRET),
    google_oauth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    admin_emails: Boolean(process.env.ADMIN_EMAILS),
    llm_provider: Boolean(
      process.env.GROQ_API_KEY ||
        process.env.COHERE_API_KEY ||
        process.env.NVIDIA_API_KEY ||
        process.env.OPENROUTER_API_KEY
    ),
  };

  const healthy = database === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      database,
      configured,
      ...(databaseError ? { database_error: databaseError } : {}),
      duration_ms: Date.now() - startedAt,
      checked_at: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
