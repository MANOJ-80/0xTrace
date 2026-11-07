"use client";

import { useState } from "react";
import Link from "next/link";
import { Experience } from "@/lib/types";
import { getOutcomeBadgeColor, cn } from "@/lib/utils";
import { PenLine, Edit, Trash2, ExternalLink, Calendar } from "lucide-react";

interface MyExperiencesClientProps {
  initialExperiences: Experience[];
  userEmail: string;
}

export default function MyExperiencesClient({
  initialExperiences,
  userEmail,
}: MyExperiencesClientProps) {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, company: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete your experience for ${company}? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/experiences/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete experience");
      }
      setExperiences((prev) => prev.filter((e) => (e._id || e.id) !== id));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Strip */}
      <header className="page-heading">
        <div>
          <div className="page-kicker">Your contributions</div>
          <h1 className="page-title">My experiences</h1>
          <p className="page-description">
            Signed in as <span className="text-ox-ink font-mono">{userEmail}</span> ·{" "}
            {experiences.length} {experiences.length === 1 ? "submission" : "submissions"}
          </p>
        </div>

          <Link
            href="/contribute"
            className="ui-action-primary"
          >
            <PenLine className="w-4 h-4" />
            <span>Share New</span>
          </Link>
      </header>

      {/* Empty State */}
      {experiences.length === 0 ? (
        <div className="empty-state max-w-lg mx-auto my-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-ox-surface-raised border border-ox-edge flex items-center justify-center">
            <PenLine className="w-6 h-6 text-ox-muted" />
          </div>
          <h2 className="text-lg font-bold text-ox-ink">No experiences published yet</h2>
          <p className="text-sm text-ox-muted leading-relaxed">
            You haven't published any interview experiences under this account.
            Help your college peers by contributing your interview journey.
          </p>
          <div className="pt-2">
            <Link
              href="/contribute"
                className="ui-action-primary"
            >
              <PenLine className="w-4 h-4" />
              <span>Share Your Experience</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Submissions Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.map((exp) => {
            const expId = exp._id || exp.id;
            const companyName =
              exp.company?.name || exp.company?.normalized_name || "Unknown Company";
            const roleName = exp.job?.role || "Software Engineer";
            const outcomeStatus = exp.outcome?.status || "Selected";
            const rounds = exp.rounds || [];
            const isDeleting = deletingId === expId;

            return (
              <div
                key={expId}
                className="experience-manage-card flex flex-col justify-between space-y-4"
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-ox-ink break-words">
                        {companyName}
                      </h3>
                      <p className="text-sm text-ox-muted break-words">
                        {roleName}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-semibold capitalize shrink-0",
                        getOutcomeBadgeColor(outcomeStatus)
                      )}
                    >
                      {outcomeStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-ox-muted font-mono">
                    <span>
                      {rounds.length} {rounds.length === 1 ? "round" : "rounds"}
                    </span>
                    <span>·</span>
                    <span>{exp.id}</span>
                    {exp.created_at && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(exp.created_at).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-ox-edge flex items-center justify-between gap-2 text-xs">
                  <Link
                    href={`/experiences/${expId}`}
                    className="inline-flex items-center gap-1 text-ox-muted hover:text-ox-ink font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/experiences/${expId}/edit`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-semibold text-ox-ink bg-ox-surface-raised border border-ox-edge hover:border-ox-accent rounded transition-colors"
                    >
                      <Edit className="w-3 h-3 text-ox-accent" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(expId, companyName)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-semibold text-red-400 bg-ox-surface-raised border border-ox-edge hover:border-red-500 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{isDeleting ? "..." : "Delete"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
