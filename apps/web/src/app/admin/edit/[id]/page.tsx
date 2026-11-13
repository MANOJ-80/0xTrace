import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { ArrowLeft, Code2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getExperienceById } from "@/lib/data";
import ManualEntryForm from "@/components/ManualEntryForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditPage({ params }: AdminEditPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect(`/login?callbackUrl=/admin/edit/${id}`);
  }
  if (!session.user.isAdmin) {
    redirect("/");
  }

  const experience = await getExperienceById(id);
  if (!experience) {
    notFound();
  }

  const companyName =
    experience.company?.name || experience.company?.normalized_name || "Company";

  return (
    <div className="space-y-8">
      <header className="admin-edit-header">
        <div className="admin-edit-header-copy">
          <Link href="/admin" className="back-link inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to experience manager
          </Link>
          <div className="page-kicker mt-3">Record editor</div>
          <h1 className="page-title">Edit {companyName}</h1>
          <p className="page-description">
            Update the structured record. Fields outside this form, including the
            source document and author, are preserved.
          </p>
        </div>
        <Link
          href={`/admin/edit/${id}/raw`}
          className="ui-action-secondary"
          title="Edit the stored document as raw JSON"
        >
          <Code2 className="h-4 w-4" />
          Raw JSON
        </Link>
      </header>

      <ManualEntryForm
        initialExperience={experience}
        experienceId={id}
        mode="edit"
        isAdmin
        adminMode
      />
    </div>
  );
}
