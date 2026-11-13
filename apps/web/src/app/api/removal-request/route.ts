import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { serverError } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 20_000;
const TYPES = new Set(["removal", "correction", "bug", "other"]);

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/**
 * Removal and correction requests.
 *
 * This does not send email. It writes a durable row that an administrator reads
 * from the database, so the path works without an email provider configured.
 */
export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request is too large" }, { status: 413 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Bots fill hidden fields. Pretend the request succeeded instead of telling
    // the bot why it failed.
    if (clean((body as Record<string, unknown>).website, 200)) {
      return NextResponse.json({ success: true });
    }

    const type = clean((body as Record<string, unknown>).type, 20) || "removal";
    const name = clean((body as Record<string, unknown>).name, 120);
    const email = clean((body as Record<string, unknown>).email, 200).toLowerCase();
    const recordUrl = clean((body as Record<string, unknown>).recordUrl, 500);
    const message = clean((body as Record<string, unknown>).message, 4000);

    if (!TYPES.has(type)) {
      return NextResponse.json({ error: "Choose a request type" }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (message.length < 20) {
      return NextResponse.json(
        { error: "Describe the request in at least 20 characters" },
        { status: 400 }
      );
    }

    const col = await getCollection("removal_requests");
    await col.insertOne({
      type,
      name: name || null,
      email,
      record_url: recordUrl || null,
      message,
      status: "open",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError("api/removal-request", error, "Could not submit the request");
  }
}
