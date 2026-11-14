import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getUsersForExport } from "@/lib/users";
import { recordActivity } from "@/lib/audit";
import { serverError } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_COLUMNS = [
  "name",
  "email",
  "role",
  "first_seen_at",
  "last_seen_at",
  "last_sign_in_at",
  "sign_in_count",
  "submissions",
] as const;

function csvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await getUsersForExport();
    const rows = users.map((user) => [
      user.name,
      user.email,
      user.is_admin ? "admin" : "student",
      user.first_seen_at,
      user.last_seen_at,
      user.last_sign_in_at,
      user.sign_in_count,
      user.submissions,
    ]);
    const csv = [CSV_COLUMNS, ...rows]
      .map((row) => row.map(csvValue).join(","))
      .join("\r\n");

    await recordActivity({
      action: "export",
      actor: { email: session.user.email, name: session.user.name },
      detail: `users-${timestamp()}.csv`,
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="0xtrace-users-${timestamp()}.csv"`,
      },
    });
  } catch (error) {
    return serverError("api/admin/users/export", error, "Failed to export accounts");
  }
}
