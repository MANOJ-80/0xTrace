import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getCollection } from "@/lib/mongodb";
import { serverError } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_COLUMNS = [
  "id",
  "company",
  "company_normalized",
  "candidate",
  "department",
  "degree",
  "college",
  "role",
  "employment_type",
  "location",
  "month",
  "year",
  "drive_type",
  "outcome",
  "offer_type",
  "ctc",
  "rounds",
  "questions",
  "quality_score",
  "quality_issues",
  "author_email",
  "author_name",
  "created_at",
  "updated_at",
  "source_file",
  "experience_number",
  "linkedin",
] as const;

function csvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const format = (req.nextUrl.searchParams.get("format") || "json").toLowerCase();

  try {
    const col = await getCollection("experiences");
    const docs = await col.find({}).sort({ created_at: 1, _id: 1 }).toArray();
    const date = timestamp();

    if (format === "csv") {
      const rows = docs.map((doc: any) => {
        const rounds = Array.isArray(doc.rounds) ? doc.rounds : [];
        const questions = rounds.reduce(
          (sum: number, round: any) => sum + (round.questions?.length || 0),
          0
        );
        return [
          doc.id,
          doc.company?.name,
          doc.company?.normalized_name,
          doc.candidate?.name,
          doc.candidate?.department,
          doc.candidate?.degree,
          doc.candidate?.college,
          doc.job?.role,
          doc.job?.employment_type,
          doc.job?.location,
          doc.timeline?.month,
          doc.timeline?.year,
          doc.timeline?.drive_type,
          doc.outcome?.status,
          doc.outcome?.offer_type,
          doc.compensation?.ctc,
          rounds.length,
          questions,
          doc.quality?.score,
          doc.quality?.issues,
          doc.author?.email,
          doc.author?.name,
          doc.created_at,
          doc.updated_at,
          doc.source?.file_name,
          doc.source?.experience_number,
          doc.contacts?.linkedin,
        ]
          .map(csvValue)
          .join(",");
      });

      const csv = [CSV_COLUMNS.join(","), ...rows].join("\r\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="0xtrace-experiences-${date}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const payload = {
      exported_at: new Date().toISOString(),
      count: docs.length,
      experiences: docs.map((doc: any) => ({
        ...doc,
        _id: doc._id?.toString(),
      })),
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="0xtrace-experiences-${date}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return serverError("api/admin/export", error, "Export failed");
  }
}
