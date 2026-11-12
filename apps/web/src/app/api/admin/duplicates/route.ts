import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { findDuplicateGroups } from "@/lib/admin-experiences";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    return NextResponse.json(await findDuplicateGroups());
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load duplicates", detail: error.message },
      { status: 500 }
    );
  }
}
