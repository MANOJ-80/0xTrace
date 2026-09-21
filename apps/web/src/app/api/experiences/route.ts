import { NextRequest, NextResponse } from "next/server";
import { getAllExperiences } from "@/lib/data";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const company = (searchParams.get("company") || "").toLowerCase().trim();
    const role = (searchParams.get("role") || "").toLowerCase().trim();
    const outcome = (searchParams.get("outcome") || "").toLowerCase().trim();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);

    let experiences = await getAllExperiences();

    if (search) {
      experiences = experiences.filter((exp) => {
        const cName = (exp.company?.name || "").toLowerCase();
        const rName = (exp.job?.role || "").toLowerCase();
        const dept = (exp.candidate?.department || "").toLowerCase();
        const candName = (exp.candidate?.name || "").toLowerCase();
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
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load experiences", detail: err.message },
      { status: 500 }
    );
  }
}
