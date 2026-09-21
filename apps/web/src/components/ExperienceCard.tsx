import Link from "next/link";
import { Experience } from "@/lib/types";
import { formatCTC } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  ChevronRight,
  Star,
  CheckCircle2,
  User,
  Layers,
  Sparkles,
} from "lucide-react";

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const companyName =
    experience.company?.name || experience.company?.normalized_name || "Unknown Company";
  const roleName = experience.job?.role || "Software Engineer";
  const outcomeStatus = experience.outcome?.status || "Selected";
  const rounds = experience.rounds || [];
  const monogram = companyName.slice(0, 2).toUpperCase();

  const candidateName =
    experience.candidate?.name || `Candidate #${experience.id.replace("exp_", "")}`;
  const candidateCollege =
    experience.candidate?.college || experience.candidate?.department || "PSG College of Technology";

  // Monogram color variations based on name hash
  const colors = [
    "from-indigo-600 to-purple-600",
    "from-purple-600 to-pink-600",
    "from-blue-600 to-cyan-600",
    "from-emerald-600 to-teal-600",
    "from-amber-600 to-orange-600",
  ];
  const colorIndex =
    Math.abs(companyName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) %
    colors.length;
  const gradient = colors[colorIndex];

  return (
    <Link
      href={`/experiences/${experience.id}`}
      className="group flex flex-col justify-between bg-[#11141c] hover:bg-[#141823] border border-[#1e2433] hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-indigo-500/5"
    >
      <div className="space-y-4">
        {/* Top bar: Company & Outcome */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-white font-black text-base flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
            >
              {monogram}
            </div>
            <div>
              <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                {companyName}
              </h3>
              <p className="text-xs font-medium text-slate-300 line-clamp-1 mt-0.5">
                {roleName}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#181d28] border border-[#232938] text-slate-400 font-medium capitalize">
                  {experience.job?.employment_type?.replace(/_/g, " ") || "Full-time"}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#181d28] border border-[#232938] text-slate-400 font-medium">
                  {experience.job?.location || "On-site"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 capitalize">
              <CheckCircle2 className="w-3 h-3" />
              {outcomeStatus}
            </span>
            {experience.compensation?.ctc && (
              <span className="text-[11px] font-bold text-emerald-400">
                {formatCTC(experience.compensation.ctc)}
              </span>
            )}
          </div>
        </div>

        {/* Rating & Rounds Stats */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1a1f2c]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              5/5
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              {rounds.length} Rounds
            </span>
          </div>

          <span className="text-slate-500 font-mono text-[11px]">
            {experience.id}
          </span>
        </div>
      </div>

      {/* Footer: Candidate Attribution & Date */}
      <div className="mt-4 pt-3 border-t border-[#1a1f2c] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="truncate text-slate-300 font-medium">
            {candidateName}
          </span>
        </div>

        <div className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0 font-medium">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
