"use client";

import { useState } from "react";
import Link from "next/link";
import { Experience } from "@/lib/types";
import RoundModal from "./RoundModal";
import { formatCTC, getOutcomeBadgeColor } from "@/lib/utils";
import {
  Code,
  Zap,
  UserCheck,
  Briefcase,
  ChevronRight,
  Clock,
  Layers,
  ArrowLeft,
  FileText,
  Lightbulb,
  User,
  GraduationCap,
  Banknote,
} from "lucide-react";
import DocumentReader from "./DocumentReader";

interface ExperienceDetailViewProps {
  experience: Experience;
}

export default function ExperienceDetailView({ experience }: ExperienceDetailViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);
  const [mainTab, setMainTab] = useState<"rounds" | "transcript">("rounds");

  const rounds = experience.rounds || [];
  const companyName =
    experience.company?.name || experience.company?.normalized_name || "Unknown Company";
  const roleName = experience.job?.role || "Software Engineer";
  const outcomeStatus = experience.outcome?.status || "Selected";

  const handleOpenRound = (index: number) => {
    setSelectedRoundIndex(index);
    setModalOpen(true);
  };

  const getRoundIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("online") || t.includes("oa") || t.includes("assessment") || t.includes("coding")) {
      return <Code className="w-4 h-4 text-blue-400" />;
    }
    if (t.includes("hr") || t.includes("behavioral") || t.includes("fit")) {
      return <UserCheck className="w-4 h-4 text-purple-400" />;
    }
    if (t.includes("manager")) {
      return <Briefcase className="w-4 h-4 text-amber-400" />;
    }
    return <Zap className="w-4 h-4 text-ox-accent" />;
  };

  const candidateName =
    experience.candidate?.name || `Candidate #${experience.id.replace("exp_", "")}`;
  const candidateCollege =
    experience.candidate?.college || "PSG iTech";

  const mistakes = experience.mistakes || [];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/experiences"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-ox-muted hover:text-ox-ink transition-colors min-h-[38px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to experiences</span>
        </Link>

        <span className="text-[11px] sm:text-xs text-ox-muted font-mono bg-ox-surface px-2 py-0.5 rounded border border-ox-edge">
          {experience.id}
        </span>
      </div>

      {/* Unified Comprehensive Header Card */}
      <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm">
        {/* Row 1: Company, Role, Outcome */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-ox-ink tracking-tight break-words">
              {companyName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-ox-muted">
              <span className="text-ox-ink font-medium">{roleName}</span>
              {experience.job?.employment_type && (
                <span className="text-ox-muted capitalize">
                  · {experience.job.employment_type.replace(/_/g, " ")}
                </span>
              )}
              {experience.job?.location && (
                <span className="text-ox-muted">
                  · {experience.job.location}
                </span>
              )}
            </div>
          </div>

          <span
            className={`inline-flex items-center self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold capitalize shrink-0 ${getOutcomeBadgeColor(
              outcomeStatus
            )}`}
          >
            {outcomeStatus}
          </span>
        </div>

        {/* Row 2: Comprehensive Metadata Bar (Candidate + Academic + Compensation + Process) */}
        <div className="pt-4 border-t border-ox-edge grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
          {/* Candidate */}
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-ox-muted flex items-center gap-1 text-[11px] sm:text-xs">
              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              Candidate
            </span>
            <p className="font-semibold text-ox-ink truncate text-xs sm:text-sm">{candidateName}</p>
            <p className="text-ox-muted truncate text-[11px] sm:text-xs">{candidateCollege}</p>
          </div>

          {/* Education & Department */}
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-ox-muted flex items-center gap-1 text-[11px] sm:text-xs">
              <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              Academic
            </span>
            <p className="font-semibold text-ox-ink truncate text-xs sm:text-sm">
              {experience.candidate?.degree || "B.Tech / B.E"}
              {experience.candidate?.cgpa && (
                <span className="ml-1 text-ox-muted font-mono font-normal">
                  ({experience.candidate.cgpa})
                </span>
              )}
            </p>
            <p className="text-ox-muted truncate text-[11px] sm:text-xs">
              {experience.candidate?.department || "Computer Science / IT"}
            </p>
          </div>

          {/* Compensation */}
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-ox-muted flex items-center gap-1 text-[11px] sm:text-xs">
              <Banknote className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              Compensation
            </span>
            <p className="font-bold text-ox-signal-pass text-xs sm:text-sm truncate">
              {formatCTC(experience.compensation?.ctc)}
            </p>
            <p className="text-ox-muted truncate text-[11px] sm:text-xs">
              {experience.timeline?.month
                ? `${experience.timeline.month} ${experience.timeline.year || "2024"}`
                : "Campus Drive"}
            </p>
          </div>

          {/* Process Stats */}
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-ox-muted flex items-center gap-1 text-[11px] sm:text-xs">
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              Process
            </span>
            <p className="font-semibold text-ox-ink font-mono tabular-nums text-xs sm:text-sm">
              {rounds.length} {rounds.length === 1 ? "Round" : "Rounds"}
            </p>
            <p className="text-ox-muted truncate text-[11px] sm:text-xs">
              {rounds.map((r) => r.type.split("_")[0]).join(" → ") || "Sequential"}
            </p>
          </div>
        </div>
      </div>

      {/* Tab switcher: Rounds vs Full Transcript (touch scrollable) */}
      <div className="flex items-center gap-1 border-b border-ox-edge overflow-x-auto no-scrollbar">
        <button
          onClick={() => setMainTab("rounds")}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap min-h-[44px] transition-colors ${
            mainTab === "rounds"
              ? "border-ox-accent text-ox-ink font-semibold"
              : "border-transparent text-ox-muted hover:text-ox-ink"
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>Interview rounds ({rounds.length})</span>
        </button>
        <button
          onClick={() => setMainTab("transcript")}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap min-h-[44px] transition-colors ${
            mainTab === "transcript"
              ? "border-ox-accent text-ox-ink font-semibold"
              : "border-transparent text-ox-muted hover:text-ox-ink"
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Original Writeup</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {mainTab === "rounds" && (
        <div className="space-y-6 sm:space-y-8">
          {/* Rounds List */}
          <div className="space-y-3">
            {rounds.map((round, idx) => {
              const roundTitle = round.name.includes("Round")
                ? round.name.replace(/-/g, ":")
                : `Round ${round.sequence}: ${round.name}`;

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenRound(idx)}
                  className="group bg-ox-surface border border-ox-edge rounded-xl p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:border-ox-accent active:scale-[0.99] transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-ox-surface-raised flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      {getRoundIcon(round.type)}
                    </div>
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-xs sm:text-base text-ox-ink group-hover:text-ox-accent transition-colors break-words">
                          {roundTitle}
                        </h3>
                        <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-ox-surface-raised text-ox-muted capitalize border border-ox-edge shrink-0">
                          {round.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-ox-muted">
                        {round.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {round.duration}
                          </span>
                        )}
                        <span>{round.platform || round.mode || "In-person"}</span>
                        {round.questions && round.questions.length > 0 && (
                          <span className="font-mono text-ox-ink">
                            {round.questions.length} questions
                          </span>
                        )}
                        {round.coding?.problems && round.coding.problems.length > 0 && (
                          <span className="font-mono text-ox-signal-pass">
                            {round.coding.problems.length} coding
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs font-medium text-ox-muted group-hover:text-ox-ink hidden md:inline transition-colors">
                      View details
                    </span>
                    <ChevronRight className="w-4 h-4 text-ox-muted group-hover:text-ox-accent transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Candidate Advice (combined tips + pitfalls) */}
          {((experience.tips && experience.tips.length > 0) || mistakes.length > 0) && (
            <div className="bg-ox-surface border border-ox-edge rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-ox-edge">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-ox-ink">Candidate advice</h2>
              </div>

              <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-ox-ink/90 leading-relaxed">
                {experience.tips && experience.tips.length > 0 && experience.tips.map((tip, i) => (
                  <div key={`tip-${i}`} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-ox-signal-pass shrink-0 mt-2" />
                    <span>{tip}</span>
                  </div>
                ))}
                {mistakes.length > 0 && mistakes.map((m, i) => (
                  <div key={`pit-${i}`} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-ox-signal-fail shrink-0 mt-2" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Transcript Tab Content */}
      {mainTab === "transcript" && (
        <DocumentReader
          content={experience.raw_text || ""}
          title={`${companyName} — Full interview transcript`}
          subtitle={`Submitted by ${candidateName} · Untouched raw text`}
        />
      )}

      {/* Round detail interactive modal */}
      <RoundModal
        rounds={rounds}
        currentIndex={selectedRoundIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectIndex={setSelectedRoundIndex}
        outcomeStatus={outcomeStatus}
      />
    </div>
  );
}
