import { NextRequest, NextResponse } from "next/server";
import { getSampleExtraction } from "@/lib/data";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name") as "walmart" | "phonepe" | "idfc";
  if (!name || !["walmart", "phonepe", "idfc"].includes(name)) {
    return NextResponse.json({ error: "Invalid sample name" }, { status: 400 });
  }

  const sample = await getSampleExtraction(name);
  if (!sample) {
    return NextResponse.json({ error: "Sample not found" }, { status: 404 });
  }

  return NextResponse.json(sample);
}
