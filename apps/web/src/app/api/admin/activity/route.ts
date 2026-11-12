import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getActivity } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = new Set(["create", "update", "delete", "bulk_delete", "merge"]);

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const action = params.get("action") || "";

  try {
    const result = await getActivity({
      page: Number(params.get("page") || 1),
      limit: Number(params.get("limit") || 25),
      action: ACTIONS.has(action) ? action : "",
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load activity", detail: error.message },
      { status: 500 }
    );
  }
}
