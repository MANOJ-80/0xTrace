import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { recordActivity } from "@/lib/audit";
import { toExperienceSummary } from "@/lib/public-experience";
import type { Experience, ModerationStatus } from "@/lib/types";

const AUTHOR_EDITABLE_FIELDS = new Set([
  "candidate",
  "company",
  "job",
  "timeline",
  "eligibility",
  "compensation",
  "pre_placement",
  "rounds",
  "outcome",
  "tips",
  "mistakes",
  "conclusion",
  "contacts",
  "additional_information",
]);

const ADMIN_ONLY_FIELDS = new Set(["quality", "raw_text", "source", "moderation_status"]);
const MODERATION_STATUSES = new Set<ModerationStatus>(["pending", "published", "rejected"]);
const MAX_JSON_BYTES = 1_000_000;

function findQuery(id: string): Record<string, unknown> {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
}

function isAuthorOf(doc: Record<string, any>, email: string): boolean {
  return Boolean(doc.author?.email && String(doc.author.email).toLowerCase() === email);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const col = await getCollection("experiences");
    const doc = await col.findOne(findQuery(id));

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const serialized = { ...doc, _id: doc._id.toString() } as unknown as Experience;
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();
    const isAdmin = Boolean(session?.user?.isAdmin);
    const isAuthor = Boolean(email && isAuthorOf(serialized, email));

    const isUnpublished =
      serialized.moderation_status === "pending" ||
      serialized.moderation_status === "rejected";
    if (isUnpublished && !isAdmin && !isAuthor) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Owners and admins need the full document for the structured and raw
    // editors. Everyone else gets the anonymous summary.
    return NextResponse.json(
      isAdmin || isAuthor ? serialized : toExperienceSummary(serialized as unknown as Record<string, any>)
    );
  } catch (error) {
    console.error("[api/experiences/:id] fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_JSON_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  try {
    const col = await getCollection("experiences");
    const query = findQuery(id);

    const existingDoc = await col.findOne(query);
    if (!existingDoc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userEmail = session.user.email.toLowerCase();
    const isAuthor = isAuthorOf(existingDoc, userEmail);
    const isAdmin = Boolean(session.user.isAdmin);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to edit this experience" },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
    }

    // Never accept server-managed identity or timestamps from the client.
    const {
      _id: _ignoredDocId,
      id: _ignoredRecordId,
      author,
      created_at: _ignoredCreatedAt,
      ...candidateUpdate
    } = body as Record<string, unknown>;

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(candidateUpdate)) {
      if (AUTHOR_EDITABLE_FIELDS.has(key)) {
        updateData[key] = value;
      } else if (isAdmin && ADMIN_ONLY_FIELDS.has(key)) {
        updateData[key] = value;
      }
    }

    if (isAdmin && author !== undefined) {
      updateData.author = author;
    }

    if (isAdmin && updateData.moderation_status !== undefined) {
      if (!MODERATION_STATUSES.has(updateData.moderation_status as ModerationStatus)) {
        return NextResponse.json({ error: "Invalid moderation status" }, { status: 400 });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No editable fields supplied" }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const result = await col.updateOne(query, { $set: updateData });

    const changedKeys = Object.keys(updateData)
      .filter((key) => key !== "updated_at")
      .slice(0, 12);
    await recordActivity({
      action: "update",
      actor: { email: session.user.email, name: session.user.name },
      target: {
        id: existingDoc.id || String(existingDoc._id),
        company: existingDoc.company?.name || null,
        candidate: existingDoc.candidate?.name || null,
      },
      detail: `${isAdmin && !isAuthor ? "Admin edit" : "Author edit"}: ${
        changedKeys.join(", ") || "no fields"
      }`,
    });

    revalidatePath("/experiences");
    revalidatePath(`/experiences/${id}`);
    revalidatePath("/my-experiences");
    revalidatePath("/questions");
    revalidatePath("/analytics");
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("[api/experiences/:id] update failed:", error);
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const col = await getCollection("experiences");
    const query = findQuery(id);

    const existingDoc = await col.findOne(query);
    if (!existingDoc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userEmail = session.user.email.toLowerCase();
    const isAuthor = isAuthorOf(existingDoc, userEmail);
    const isAdmin = Boolean(session.user.isAdmin);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete this experience" },
        { status: 403 }
      );
    }

    const result = await col.deleteOne(query);

    await recordActivity({
      action: "delete",
      actor: { email: session.user.email, name: session.user.name },
      target: {
        id: existingDoc.id || String(existingDoc._id),
        company: existingDoc.company?.name || null,
        candidate: existingDoc.candidate?.name || null,
      },
      detail: isAdmin && !isAuthor ? "Admin delete" : "Author delete",
    });

    const metaCol = await getCollection("metadata");
    const totalCount = await col.countDocuments();
    await metaCol.updateOne(
      { _id: "dataset_metadata" } as any,
      { $set: { total_experiences: totalCount, updated_at: new Date().toISOString() } }
    );

    revalidatePath("/experiences");
    revalidatePath(`/experiences/${id}`);
    revalidatePath("/my-experiences");
    revalidatePath("/questions");
    revalidatePath("/analytics");
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/experiences/:id] delete failed:", error);
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}
