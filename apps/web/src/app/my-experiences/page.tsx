import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserExperiences } from "@/lib/data";
import { PRIVATE_ROBOTS } from "@/lib/metadata";
import MyExperiencesClient from "./MyExperiencesClient";

export const metadata = {
  robots: PRIVATE_ROBOTS,
  title: "My Experiences — 0xTrace",
  description: "View and manage interview experiences you have shared.",
};

export const revalidate = 0;

export default async function MyExperiencesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/login?callbackUrl=/my-experiences");
  }

  const experiences = await getUserExperiences(session.user.email);

  return <MyExperiencesClient initialExperiences={experiences} userEmail={session.user.email} />;
}
