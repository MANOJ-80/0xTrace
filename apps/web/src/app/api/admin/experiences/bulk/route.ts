import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { getCollection } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BULK = 100;
const OBJECT_ID = /^[0-9a-f]{24}$/i;

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.filter((value: unknown): value is string => typeof value === "string" && value.length > 0)
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "No records selected" }, { status: 400 });
  }
  if (ids.length > MAX_BULK) {
    return NextResponse.json(
      { error: `Delete at most ${MAX_BULK} records at a time` },
      { status: 400 }
    );
  }

  const objectIds = ids.filter((id) => OBJECT_ID.test(id)).map((id) => new ObjectId(id));
  const stringIds = ids.filter((id) => !OBJECT_ID.test(id));
  const clauses: Record<string, unknown>[] = [];
  if (objectIds.length > 0) clauses.push({ _id: { $in: objectIds } });
  if (stringIds.length > 0) clauses.push({ id: { $in: stringIds } });

  try {
    const col = await getCollection("experiences");
    const result = await col.deleteMany({ $or: clauses });

    const metaCol = await getCollection("metadata");
    const totalCount = await col.countDocuments();
    await metaCol.updateOne(
      { _id: "dataset_metadata" } as any,
      { $set: { total_experiences: totalCount, updated_at: new Date().toISOString() } }
    );

    revalidatePath("/experiences");
    revalidatePath("/my-experiences");
    revalidatePath("/questions");
    revalidatePath("/analytics");
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete records", detail: error.message },
      { status: 500 }
    );
  }
}
