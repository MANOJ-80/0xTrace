import { notFound } from "next/navigation";
import { getExperienceById } from "@/lib/data";
import ExperienceDetailView from "@/components/ExperienceDetailView";

// Dynamic rendering — data comes from MongoDB at request time
export const dynamic = "force-dynamic";

interface ExperienceDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ExperienceDetailPage({ params }: ExperienceDetailPageProps) {
  const experience = await getExperienceById(params.id);

  if (!experience) {
    notFound();
  }

  return <ExperienceDetailView experience={experience} />;
}
