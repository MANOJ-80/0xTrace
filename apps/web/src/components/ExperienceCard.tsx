"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExperienceSummary } from "@/lib/types";
import { cn, getOutcomeBadgeColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { ArrowUpRight } from "lucide-react";

interface ExperienceCardProps {
  experience: ExperienceSummary;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const { status } = useSession();
  const router = useRouter();
  
  const companyName =
    experience.company?.name || experience.company?.normalized_name || "Unknown Company";
  const roleName = experience.job?.role || "Software Engineer";
  const outcomeStatus = experience.outcome?.status || "Not reported";
  const roundCount = experience.round_count;

  const candidateName =
    experience.candidate?.display_name || `Candidate #${experience.id.replace("exp_", "")}`;

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
      className="experience-card group outline-none focus-visible:ring-2 focus-visible:ring-ox-accent"
    >
      <div className="experience-company-role">
        <h3>{companyName}</h3>
        <p>{roleName}</p>
      </div>
      <span className="experience-candidate">{candidateName}</span>
      <span className={cn("ui-status experience-outcome", getOutcomeBadgeColor(outcomeStatus))}>
        {outcomeStatus}
      </span>
      <span className="experience-card-meta">
        {roundCount} {roundCount === 1 ? "round" : "rounds"}
        <span className="font-mono">{experience.id}</span>
        <ArrowUpRight className="experience-card-arrow w-4 h-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
