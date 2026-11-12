import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getCollection } from "@/lib/mongodb";
import { normalizeCompanyKey } from "@/lib/company";
import { recordActivity } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recompute `company.normalized_name` for every record.
 *
 * Older imports stored raw slugified names, so "IDFC First Bank Ltd." and
 * "IDFC FIRST Bank" produced different keys. The public API filter and company
 * grouping now share one canonical key.
 */
export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const col = await getCollection("experiences");
    const docs = await col
      .find({}, { projection: { company: 1 } })
      .toArray();

    const operations = [];
    const variants = new Map<string, Set<string>>();
    let unscanned = 0;

    for (const doc of docs) {
      const name = doc.company?.name;
      if (!name) {
        unscanned += 1;
        continue;
      }

      const key = normalizeCompanyKey(name);
      if (!key) {
        unscanned += 1;
        continue;
      }

      if (!variants.has(key)) variants.set(key, new Set());
      variants.get(key)!.add(name);

      if (doc.company?.normalized_name !== key) {
        operations.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { "company.normalized_name": key } },
          },
        });
      }
    }

    if (operations.length > 0) {
      for (let i = 0; i < operations.length; i += 500) {
        await col.bulkWrite(operations.slice(i, i + 500));
      }
    }

    const variantGroups = Array.from(variants.entries()).filter(
      ([, names]) => names.size > 1
    ).length;

    await recordActivity({
      action: "update",
      actor: { email: session.user.email, name: session.user.name },
      target: { id: "company-normalization" },
      count: operations.length,
      detail: `Normalized ${operations.length} company keys · ${variantGroups} spelling variant groups`,
    });

    revalidatePath("/experiences");
    revalidatePath("/questions");
    revalidatePath("/analytics");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      scanned: docs.length,
      updated: operations.length,
      skipped: unscanned,
      companies: variants.size,
      variantGroups,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Normalization failed", detail: error.message },
      { status: 500 }
    );
  }
}
