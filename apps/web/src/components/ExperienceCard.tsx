"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Experience } from "@/lib/types";
import { cn, getOutcomeBadgeColor } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const { status } = useSession();
  const router = useRouter();
  
  const companyName =
    experience.company?.name || experience.company?.normalized_name || "Unknown Company";
  const roleName = experience.job?.role || "Software Engineer";
  const outcomeStatus = experience.outcome?.status || "Selected";
  const rounds = experience.rounds || [];

  const candidateName =
    experience.candidate?.name || `Candidate #${experience.id.replace("exp_", "")}`;
    
  const href = `/experiences/${experience._id || experience.id}`;

  const handleClick = (e: React.MouseEvent) => {
    if (status !== "authenticated") {
      e.preventDefault();
      router.push(`/login?callbackUrl=${encodeURIComponent(href)}`);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="block bg-ox-surface border border-ox-edge hover:border-ox-accent rounded-lg p-4 outline-none focus-visible:ring-2 focus-visible:ring-ox-accent focus-visible:border-ox-accent transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex flex-col min-w-0">
          <h3 className="font-bold text-base text-ox-ink break-words">
            {companyName}
          </h3>
          <p className="text-sm font-normal text-ox-muted break-words">
            {roleName}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-sm text-ox-muted">
            {rounds.length} {rounds.length === 1 ? 'round' : 'rounds'}
          </span>
          <span
            className={cn(
              "px-2 py-0.5 text-xs font-semibold rounded-sm capitalize",
              getOutcomeBadgeColor(outcomeStatus)
            )}
          >
            {outcomeStatus}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-ox-muted">
          {candidateName}
        </span>
        <span className="text-xs text-ox-muted font-mono">
          {experience.id}
        </span>
      </div>
    </Link>
  );
}
