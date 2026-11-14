import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getPublishSettings, setPublishSettings } from "@/lib/publish-settings";
import { serverError } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    return NextResponse.json(await getPublishSettings());
  } catch (error) {
    return serverError("api/admin/settings", error, "Failed to load settings");
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.requireApproval !== "boolean") {
      return NextResponse.json(
        { error: "requireApproval must be a boolean" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      await setPublishSettings({ requireApproval: body.requireApproval })
    );
  } catch (error) {
    return serverError("api/admin/settings", error, "Failed to save settings");
  }
}
