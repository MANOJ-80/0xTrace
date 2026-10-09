"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Experience } from "@/lib/types";
import { cn, getOutcomeBadgeColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Layers, GraduationCap, Building2 } from "lucide-react";

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
  const candidateCollege =
    experience.candidate?.college || "PSG iTech";
  const candidateDept =
    experience.candidate?.department || "";
    
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
      className="block bg-ox-surface border border-ox-edge hover:border-ox-accent active:scale-[0.99] rounded-xl p-4 sm:p-5 outline-none focus-visible:ring-2 focus-visible:ring-ox-accent focus-visible:border-ox-accent transition-all group"
    >
      {/* Top Row: Company Name & Badges */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="font-bold text-base sm:text-lg text-ox-ink group-hover:text-ox-accent transition-colors truncate">
            {companyName}
          </h3>
          <p className="text-xs sm:text-sm font-normal text-ox-muted truncate">
            {roleName}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 font-mono text-xs text-ox-muted bg-ox-surface-raised px-2 py-0.5 rounded border border-ox-edge">
            <Layers className="w-3 h-3 text-ox-muted" />
            <span>{rounds.length} {rounds.length === 1 ? 'rnd' : 'rnds'}</span>
          </span>
          <span
            className={cn(
              "px-2 py-0.5 text-[11px] sm:text-xs font-semibold rounded-sm capitalize shrink-0",
              getOutcomeBadgeColor(outcomeStatus)
            )}
          >
            {outcomeStatus}
          </span>
        </div>
      </div>

      {/* Bottom Metadata: Candidate, Dept & College */}
      <div className="pt-3 border-t border-ox-edge/60 flex items-center justify-between text-xs text-ox-muted gap-2">
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <GraduationCap className="w-3.5 h-3.5 text-ox-muted shrink-0" />
          <span className="text-ox-ink font-medium truncate">{candidateName}</span>
          {candidateDept && (
            <span className="hidden sm:inline text-ox-muted truncate">· {candidateDept}</span>
          )}
        </div>
        <span className="shrink-0 text-[11px] text-ox-muted font-mono">{candidateCollege}</span>
      </div>
    </Link>
  );
}
