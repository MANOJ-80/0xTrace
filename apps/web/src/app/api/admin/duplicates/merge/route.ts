import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { getCollection } from "@/lib/mongodb";
import { recordActivity } from "@/lib/audit";
import {
  mergeExperienceDocuments,
  sameCompanyAndCandidate,
} from "@/lib/merge-experience";
import type { Experience } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SOURCES = 25;

function idQuery(id: string) {
  const clauses: Record<string, unknown>[] = [{ id }];
  if (/^[0-9a-f]{24}$/i.test(id)) {
    clauses.push({ _id: new ObjectId(id) });
  }
  return { $or: clauses };
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const targetId = typeof body?.targetId === "string" ? body.targetId : "";
  const sourceIds: string[] = Array.isArray(body?.sourceIds)
    ? Array.from(
        new Set(
          body.sourceIds.filter(
            (value: unknown): value is string =>
              typeof value === "string" && value.length > 0
          )
        )
      )
    : [];

  if (!targetId) {
    return NextResponse.json({ error: "No target record selected" }, { status: 400 });
  }
  if (sourceIds.length === 0) {
    return NextResponse.json({ error: "No records to merge" }, { status: 400 });
  }
  if (sourceIds.length > MAX_SOURCES) {
    return NextResponse.json(
      { error: `Merge at most ${MAX_SOURCES} records at a time` },
      { status: 400 }
    );
  }
  if (sourceIds.includes(targetId)) {
    return NextResponse.json(
      { error: "The target record cannot also be a source" },
      { status: 400 }
    );
  }

  try {
    const col = await getCollection("experiences");

    const targetDoc = await col.findOne(idQuery(targetId));
    if (!targetDoc) {
      return NextResponse.json({ error: "Target record not found" }, { status: 404 });
    }

    const sourceDocs = await Promise.all(
      sourceIds.map((id) => col.findOne(idQuery(id)))
    );

    if (sourceDocs.some((doc) => !doc)) {
      return NextResponse.json(
        { error: "One or more source records no longer exist" },
        { status: 404 }
      );
    }

    if (
      sourceDocs.some(
        (doc) => doc && String(doc._id) === String(targetDoc._id)
      )
    ) {
      return NextResponse.json(
        { error: "The target record resolves to one of the sources" },
        { status: 400 }
      );
    }

    for (const source of sourceDocs) {
      if (!sameCompanyAndCandidate(targetDoc as unknown as Experience, source as unknown as Experience)) {
        return NextResponse.json(
          {
            error:
              "Every source must share the target's company and candidate. Refresh the duplicate list and try again.",
          },
          { status: 400 }
        );
      }
    }

    let merged: Record<string, any> = { ...targetDoc };
    for (const source of sourceDocs) {
      if (!source) continue;
      merged = mergeExperienceDocuments(merged, source as Record<string, any>);
    }

    const { _id: _targetObjectId, ...update } = merged;
    await col.updateOne({ _id: targetDoc._id }, { $set: update });

    const sourceObjectIds = sourceDocs
      .map((doc) => doc!._id)
      .filter(Boolean);
    const removal = await col.deleteMany({ _id: { $in: sourceObjectIds } });

    const metaCol = await getCollection("metadata");
    const totalCount = await col.countDocuments();
    await metaCol.updateOne(
      { _id: "dataset_metadata" } as any,
      { $set: { total_experiences: totalCount, updated_at: new Date().toISOString() } }
    );

    await recordActivity({
      action: "merge",
      actor: { email: session.user.email, name: session.user.name },
      target: {
        id: targetDoc.id || String(targetDoc._id),
        company: targetDoc.company?.name || null,
        candidate: targetDoc.candidate?.name || null,
      },
      count: removal.deletedCount,
      detail: `Merged ${removal.deletedCount} duplicate record${
        removal.deletedCount === 1 ? "" : "s"
      } into ${targetDoc.id || String(targetDoc._id)}`,
    });

    revalidatePath("/experiences");
    revalidatePath(`/experiences/${targetDoc.id || String(targetDoc._id)}`);
    revalidatePath("/my-experiences");
    revalidatePath("/questions");
    revalidatePath("/analytics");
    revalidatePath("/admin");
    revalidatePath("/admin/duplicates");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      targetId: targetDoc.id || String(targetDoc._id),
      merged: removal.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Merge failed", detail: error.message },
      { status: 500 }
    );
  }
}
