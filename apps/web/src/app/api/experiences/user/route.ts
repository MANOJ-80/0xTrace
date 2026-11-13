import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserExperiences } from "@/lib/data";
import { serverError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const experiences = await getUserExperiences(session.user.email);

    return NextResponse.json({
      total: experiences.length,
      experiences,
    });
  } catch (error) {
    return serverError("api/experiences/user", error, "Failed to load user experiences");
  }
}
