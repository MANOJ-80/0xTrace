import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminUsers, type AdminUserSort } from "@/lib/users";
import { serverError } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORTS = new Set<AdminUserSort>(["active", "newest", "name"]);

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const sortParam = (params.get("sort") || "active") as AdminUserSort;

  try {
    const result = await getAdminUsers({
      q: params.get("q") || "",
      sort: SORTS.has(sortParam) ? sortParam : "active",
      page: Number(params.get("page") || 1),
      limit: Number(params.get("limit") || 25),
    });
    return NextResponse.json(result);
  } catch (error) {
    return serverError("api/admin/users", error, "Failed to load accounts");
  }
}
