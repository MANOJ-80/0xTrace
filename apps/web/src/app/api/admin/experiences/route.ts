import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminExperiences, type AdminSort } from "@/lib/admin-experiences";

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

  try {
    const result = await getAdminExperiences({
      q: params.get("q") || "",
      outcome: params.get("outcome") || "",
      quality: qualityParam === "flagged" || qualityParam === "ok" ? qualityParam : "",
      attention: qualityParam === "attention",
      sort: SORTS.has(sortParam) ? sortParam : "recent",
      page: Number(params.get("page") || 1),
      limit: Number(params.get("limit") || 25),
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load experiences", detail: error.message },
      { status: 500 }
    );
  }
}
