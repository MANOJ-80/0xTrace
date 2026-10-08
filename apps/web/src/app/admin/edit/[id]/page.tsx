import EditExperienceClient from "./EditExperienceClient";

export const revalidate = 3600;

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function EditExperiencePage({ params }: EditPageProps) {
  return <EditExperienceClient id={params.id} />;
}
