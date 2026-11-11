import { notFound } from "next/navigation";
import { getExperienceById } from "@/lib/data";
import ExperienceDetailView from "@/components/ExperienceDetailView";

// Dynamic rendering — data comes from MongoDB at request time
export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";

interface ExperienceDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ExperienceDetailPageProps): Promise<Metadata> {
  const exp = await getExperienceById(params.id);
  if (!exp) {
    return {
      title: "Experience Not Found",
      description: "Campus interview experience not found on 0xTrace.",
    };
  }

  const company =
    exp.company?.name || exp.company?.normalized_name || "Campus Recruiter";
  const role = exp.job?.role || "Software Engineer";
  const candidate = exp.candidate?.name || "Student Candidate";
  const outcome = exp.outcome?.status || "Interview Experience";
  const roundsCount = exp.rounds?.length || 0;
  const compensation = exp.compensation?.ctc ? ` · ${exp.compensation.ctc}` : "";
  const college = exp.candidate?.college || "PSG iTech";

  const title = `${company} — ${role} (${outcome})`;
  const description = `${candidate}'s (${college}) campus interview experience at ${company} for ${role}${compensation}. Verbatim breakdown of ${roundsCount} rounds, technical questions, coding problems & preparation tips.`;

  return {
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
  const experience = await getExperienceById(params.id);

  if (!experience) {
    notFound();
  }

  return <ExperienceDetailView experience={experience} />;
}
