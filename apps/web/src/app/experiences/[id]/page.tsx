import { notFound } from "next/navigation";
import { getExperienceById, getAllExperiences } from "@/lib/data";
import ExperienceDetailView from "@/components/ExperienceDetailView";

interface ExperienceDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const experiences = await getAllExperiences();
  return experiences.map((exp) => ({
    id: exp.id,
  }));
}

export default async function ExperienceDetailPage({ params }: ExperienceDetailPageProps) {
  const experience = await getExperienceById(params.id);

  if (!experience) {
    notFound();
  }

  return <ExperienceDetailView experience={experience} />;
}
