import EditExperienceClient from "./EditExperienceClient";

export const revalidate = 3600;

interface RawEditPageProps {
  params: {
    id: string;
  };
}

export default function RawEditPage({ params }: RawEditPageProps) {
  return <EditExperienceClient id={params.id} />;
}
