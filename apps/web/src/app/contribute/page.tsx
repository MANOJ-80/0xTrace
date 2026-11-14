import ManualEntryForm from "@/components/ManualEntryForm";
import { PenLine } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserExperienceCount } from "@/lib/data";
import { getPublishSettings } from "@/lib/publish-settings";
import { PRIVATE_ROBOTS } from "@/lib/metadata";

export const metadata = {
  robots: PRIVATE_ROBOTS,
  title: "Contribute — 0xTrace",
  description: "Share your interview experience to help future candidates.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContributePage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || "";
  const isAdmin = Boolean(session?.user?.isAdmin);

  const publishedCount = email ? await getUserExperienceCount(email) : 0;
  const hasPublished = publishedCount >= 1;
  const publishSettings = await getPublishSettings();

  return (
    <div className="space-y-7">
      <header className="page-heading">
        <div className="page-heading-copy">
          <div className="page-kicker">Community contribution</div>
          <h1 className="page-title">Share your interview experience</h1>
          <p className="page-description">
            Add your company, interview rounds, and the advice you would pass on to the next candidate.
          </p>
        </div>
        <div className="page-heading-icon"><PenLine className="w-5 h-5 text-ox-accent" /></div>
      </header>

      <ManualEntryForm
        hasPublished={hasPublished}
        isAdmin={isAdmin}
        requireApproval={publishSettings.requireApproval}
      />
    </div>
  );
}
