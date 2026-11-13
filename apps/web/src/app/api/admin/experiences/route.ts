import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminExperiences, type AdminSort } from "@/lib/admin-experiences";
import { serverError } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORTS = new Set<AdminSort>(["recent", "oldest", "company", "candidate", "quality"]);

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const qualityParam = params.get("quality") || "";
  const sortParam = (params.get("sort") || "recent") as AdminSort;
  const statusParam = params.get("status") || "";

  try {
    const result = await getAdminExperiences({
      q: params.get("q") || "",
      outcome: params.get("outcome") || "",
      quality: qualityParam === "flagged" || qualityParam === "ok" ? qualityParam : "",
      attention: qualityParam === "attention",
      status:
        statusParam === "pending" || statusParam === "published" || statusParam === "rejected"
          ? statusParam
          : "",
      sort: SORTS.has(sortParam) ? sortParam : "recent",
      page: Number(params.get("page") || 1),
      limit: Number(params.get("limit") || 25),
    });
    return NextResponse.json(result);
  } catch (error) {
    return serverError("api/admin/experiences", error, "Failed to load experiences");
  }
}
