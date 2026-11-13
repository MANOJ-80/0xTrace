import { NextRequest, NextResponse } from "next/server";
import { getExperienceSummaries } from "@/lib/data";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = (searchParams.get("search") || "").toLowerCase().trim().slice(0, 100);
    const company = (searchParams.get("company") || "").toLowerCase().trim().slice(0, 100);
    const role = (searchParams.get("role") || "").toLowerCase().trim().slice(0, 100);
    const outcome = (searchParams.get("outcome") || "").toLowerCase().trim().slice(0, 40);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24", 10) || 24));

    let experiences = await getExperienceSummaries();

    if (search) {
      experiences = experiences.filter((exp) => {
        const cName = (exp.company?.name || "").toLowerCase();
        const rName = (exp.job?.role || "").toLowerCase();
        const dept = (exp.candidate?.department || "").toLowerCase();
        const candName = (exp.candidate?.display_name || "").toLowerCase();
        return (
          cName.includes(search) ||
          rName.includes(search) ||
          dept.includes(search) ||
          candName.includes(search)
        );
      });
    }

    if (company) {
      experiences = experiences.filter(
        (exp) =>
          (exp.company?.name || "").toLowerCase() === company ||
          (exp.company?.normalized_name || "").toLowerCase() === company
      );
    }

    if (role) {
      experiences = experiences.filter((exp) =>
        (exp.job?.role || "").toLowerCase().includes(role)
      );
    }

    if (outcome) {
      experiences = experiences.filter((exp) =>
        (exp.outcome?.status || "").toLowerCase().includes(outcome)
      );
    }

    const total = experiences.length;
    const startIndex = (page - 1) * limit;
    const paginated = experiences.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      experiences: paginated,
    });
  } catch (error) {
    console.error("[api/experiences] list failed:", error);
    return NextResponse.json({ error: "Failed to load experiences" }, { status: 500 });
  }
}
