import EditExperienceClient from "./EditExperienceClient";

export const revalidate = 3600;

interface RawEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function RawEditPage({ params }: RawEditPageProps) {
  const { id } = await params;
  return <EditExperienceClient id={id} />;
}
