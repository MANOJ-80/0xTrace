import { NextRequest, NextResponse } from "next/server";
import { ingestExperienceToCanonical } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const draft = body.experience;

    if (!draft) {
      return NextResponse.json(
        { error: "No experience payload provided in request body." },
        { status: 400 }
      );
    }

    if (!draft.company?.name && !draft.company?.normalized_name) {
      return NextResponse.json(
        { error: "Experience must include a valid company name." },
        { status: 400 }
      );
    }

    if (!draft.rounds || !Array.isArray(draft.rounds) || draft.rounds.length === 0) {
      return NextResponse.json(
        { error: "Experience must include at least one interview round." },
        { status: 400 }
      );
    }

    const result = await ingestExperienceToCanonical(draft);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Ingestion failed", detail: err.message },
      { status: 500 }
    );
  }
}
