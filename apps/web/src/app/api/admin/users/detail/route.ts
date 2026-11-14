import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminUserDetail } from "@/lib/users";
import { serverError } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = (req.nextUrl.searchParams.get("email") || "").trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getAdminUserDetail(email));
  } catch (error) {
    return serverError("api/admin/users/detail", error, "Failed to load account");
  }
}
