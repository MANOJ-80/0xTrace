import EditExperienceClient from "./EditExperienceClient";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function EditExperiencePage({ params }: EditPageProps) {
  return <EditExperienceClient id={params.id} />;
}
