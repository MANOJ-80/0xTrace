import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { getExperienceById } from "@/lib/data";
import { authOptions } from "@/lib/auth";
import { PRIVATE_ROBOTS } from "@/lib/metadata";
import ExperienceDetailView from "@/components/ExperienceDetailView";

// Dynamic rendering — data comes from MongoDB at request time
export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";

interface ExperienceDetailPageProps {
  params: Promise<{ id: string }>;
}

function canView(experience: NonNullable<Awaited<ReturnType<typeof getExperienceById>>>, email?: string | null, isAdmin?: boolean) {
  if (experience.moderation_status !== "pending") return true;
  if (isAdmin) return true;
  return Boolean(email && experience.author?.email?.toLowerCase() === email.toLowerCase());
}

export async function generateMetadata({
  params,
}: ExperienceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const exp = await getExperienceById(id);
  if (!exp) {
    return {
      robots: PRIVATE_ROBOTS,
      title: "Experience Not Found",
      description: "Campus interview experience not found on 0xTrace.",
    };
  }

  const session = await getServerSession(authOptions);
  if (!canView(exp, session?.user?.email, session?.user?.isAdmin)) {
    return {
      robots: PRIVATE_ROBOTS,
      title: "Experience Not Found",
    };
  }

  const company =
    exp.company?.name || exp.company?.normalized_name || "Campus Recruiter";
  const role = exp.job?.role || "Software Engineer";
  const outcome = exp.outcome?.status || "Interview Experience";
  const roundsCount = exp.rounds?.length || 0;
  const compensation = exp.compensation?.ctc ? ` · ${exp.compensation.ctc}` : "";

  const title = `${company} — ${role} (${outcome})`;
  const description = `Campus interview experience at ${company} for ${role}${compensation}. A structured breakdown of ${roundsCount} rounds, technical questions, and preparation tips.`;

  return {
    robots: PRIVATE_ROBOTS,
    title,
    description,
    openGraph: {
      title: `${company} — ${role} (${outcome}) | 0xTrace`,
      description,
      type: "article",
      siteName: "0xTrace",
    },
    twitter: {
      card: "summary_large_image",
      title: `${company} — ${role} (${outcome}) | 0xTrace`,
      description,
    },
  };
}

export default async function ExperienceDetailPage({ params }: ExperienceDetailPageProps) {
  const { id } = await params;
  const experience = await getExperienceById(id);

  if (!experience) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (!canView(experience, session?.user?.email, session?.user?.isAdmin)) {
    notFound();
  }

  return <ExperienceDetailView experience={experience} />;
}
