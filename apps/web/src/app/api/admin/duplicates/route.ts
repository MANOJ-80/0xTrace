import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { findDuplicateGroups } from "@/lib/admin-experiences";
import { serverError } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    return NextResponse.json(await findDuplicateGroups());
  } catch (error) {
    return serverError("api/admin/duplicates", error, "Failed to load duplicates");
  }
}
