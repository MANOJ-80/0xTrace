import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getExperienceById } from "@/lib/data";
import ManualEntryForm from "@/components/ManualEntryForm";
import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";

export const revalidate = 0;

interface EditExperiencePageProps {
  params: {
    id: string;
  };
}

export default async function EditExperiencePage({ params }: EditExperiencePageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect(`/login?callbackUrl=/experiences/${params.id}/edit`);
  }

  const experience = await getExperienceById(params.id);
  if (!experience) {
    notFound();
  }

  const userEmail = session.user.email.toLowerCase();
  const isAuthor =
    experience.author?.email &&
    experience.author.email.toLowerCase() === userEmail;
  const isAdmin = !!session.user.isAdmin;

  if (!isAuthor && !isAdmin) {
    redirect(`/experiences/${params.id}`);
  }

  const companyName =
    experience.company?.name || experience.company?.normalized_name || "Company";

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-ox-edge pb-4">
        <Link
          href={`/experiences/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-ox-muted hover:text-ox-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to experience</span>
        </Link>
        <span className="text-xs font-mono text-ox-muted">{experience.id}</span>
      </div>

      <div className="text-center space-y-3 mb-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-ox-accent/10 border-2 border-ox-accent flex items-center justify-center">
          <PenLine className="w-5 h-5 text-ox-accent" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ox-ink">
          Edit Experience — {companyName}
        </h1>
        <p className="text-sm text-ox-muted max-w-lg mx-auto">
          Update the interview rounds, questions, or outcome details. Your updates
          will be saved directly to the database.
        </p>
      </div>

      <ManualEntryForm
        initialExperience={experience}
        experienceId={params.id}
        mode="edit"
      />
    </div>
  );
}
