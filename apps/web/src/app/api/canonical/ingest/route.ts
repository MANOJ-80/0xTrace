import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ingestExperienceToCanonical, getUserExperienceCount } from "@/lib/data";
import { ExperienceExtractionSchema } from "@/lib/extraction-schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { recordActivity } from "@/lib/audit";
import { getPublishSettings } from "@/lib/publish-settings";
import { redactContactDetails } from "@/lib/pii";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 1_000_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  try {
    const body = await req.json();
    const rawDraft = body.experience;

    if (!rawDraft || typeof rawDraft !== "object") {
      return NextResponse.json(
        { error: "No experience payload provided in request body." },
        { status: 400 }
      );
    }

    // Re-validate on the server. The preview UI can be bypassed with curl.
    const parsed = ExperienceExtractionSchema.safeParse(rawDraft);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid experience payload",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // Remove email addresses and phone numbers before the record can publish.
    const redaction = redactContactDetails(parsed.data);
    const draft = redaction.value;
    const redactions = redaction.count;

    if (!draft.company?.name && !draft.company?.normalized_name) {
      return NextResponse.json(
        { error: "Experience must include a company name." },
        { status: 400 }
      );
    }

    if (!Array.isArray(draft.rounds) || draft.rounds.length === 0) {
      return NextResponse.json(
        { error: "Experience must include at least one interview round." },
        { status: 400 }
      );
    }

    const author = {
      email: session.user.email,
      name: session.user.name || null,
      image: session.user.image || null,
    };

    // Non-admin accounts are limited to one published submission
    if (!session.user.isAdmin) {
      const existingCount = await getUserExperienceCount(session.user.email);
      if (existingCount >= 1) {
        return NextResponse.json(
          {
            error: "Submission limit reached",
            detail:
              "Student accounts are limited to one published interview experience. You can review or edit your submission from My Experiences.",
          },
          { status: 403 }
        );
      }
    }

    const publishSettings = session.user.isAdmin ? null : await getPublishSettings();
    const moderationStatus = session.user.isAdmin
      ? "published"
      : publishSettings?.requireApproval
        ? "pending"
        : "published";
    const result = await ingestExperienceToCanonical(draft, author, { moderationStatus });

    if (result.duplicate) {
      return NextResponse.json({
        ...result,
        moderation_status: moderationStatus,
        redactions,
        message: `This source PDF is already published as ${result.assigned_id}.`,
      });
    }

    await recordActivity({
      action: "create",
      actor: { email: author.email, name: author.name },
      target: {
        id: result.assigned_id,
        company: draft.company?.name || null,
        candidate: draft.candidate?.name || null,
      },
      detail: session.user.isAdmin ? "Admin submission" : "Author submission",
    });

    revalidatePath("/experiences");
    revalidatePath("/my-experiences");
    revalidatePath("/questions");
    revalidatePath("/analytics");
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({
      ...result,
      moderation_status: moderationStatus,
      redactions,
    });
  } catch (error) {
    console.error("[Ingest] failed:", error);
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}
