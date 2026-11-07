"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Experience } from "@/lib/types";
import { cn, getOutcomeBadgeColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { ArrowUpRight, Building2, Layers } from "lucide-react";

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
      className="experience-card group block outline-none focus-visible:ring-2 focus-visible:ring-ox-accent"
    >
      <div className="experience-card-heading">
        <div className="flex flex-col min-w-0">
          <div className="experience-company-line"><Building2 className="w-4 h-4" /><span>Candidate account</span></div>
          <h3 className="font-semibold text-[15px] text-ox-ink break-words">
            {companyName}
          </h3>
          <p className="text-sm font-normal text-ox-text break-words">
            {roleName}
          </p>
        </div>

        <div className="flex items-center shrink-0">
          <span
            className={cn(
              "px-2.5 py-1 text-[10px] font-semibold capitalize",
              getOutcomeBadgeColor(outcomeStatus)
            )}
          >
            {outcomeStatus}
          </span>
        </div>
      </div>

      <div className="experience-card-footer">
        <span className="experience-candidate">{candidateName}</span>
        <div className="experience-card-meta">
          <span><Layers className="w-3.5 h-3.5" />{rounds.length} {rounds.length === 1 ? "round" : "rounds"}</span>
          <span className="font-mono">{experience.id}</span>
          <ArrowUpRight className="experience-card-arrow w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
