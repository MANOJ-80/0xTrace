"use client";

import { useState } from "react";
import Link from "next/link";
import { Experience, Round } from "@/lib/types";
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
  Building2,
  Calendar,
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
    if (t.includes("online") || t.includes("oa") || t.includes("assessment")) {
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

  // Common pitfalls / mistakes — sourced from experience data
  const mistakes = experience.mistakes || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/experiences"
          className="inline-flex items-center gap-1.5 text-sm text-ox-muted hover:text-ox-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to experiences</span>
        </Link>

        <span className="text-xs text-ox-muted font-mono">
          {experience.id}
        </span>
      </div>

      {/* Unified Comprehensive Header Card */}
      <div className="bg-ox-surface border border-ox-edge rounded-lg p-5 sm:p-6 space-y-5">
        {/* Row 1: Company, Role, Outcome */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-ox-ink tracking-tight">
              {companyName}
            </h1>
            <p className="text-sm text-ox-muted">
              <span className="text-ox-ink font-medium">{roleName}</span>
              {experience.job?.employment_type && (
                <span className="ml-2 text-xs capitalize text-ox-muted">
                  · {experience.job.employment_type.replace(/_/g, " ")}
                </span>
              )}
              {experience.job?.location && (
                <span className="ml-2 text-xs text-ox-muted">
                  · {experience.job.location}
                </span>
              )}
            </p>
          </div>

          <span
            className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold capitalize shrink-0 ${getOutcomeBadgeColor(
              outcomeStatus
            )}`}
          >
            {outcomeStatus}
          </span>
        </div>

        {/* Row 2: Comprehensive Metadata Bar (Candidate + Background + Drive specs) */}
        <div className="pt-4 border-t border-ox-edge grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {/* Candidate */}
          <div className="space-y-1">
            <span className="text-ox-muted flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Candidate
            </span>
            <p className="font-semibold text-ox-ink truncate">{candidateName}</p>
            <p className="text-ox-muted truncate">{candidateCollege}</p>
          </div>

          {/* Education & Department */}
          <div className="space-y-1">
            <span className="text-ox-muted flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Academic
            </span>
            <p className="font-semibold text-ox-ink truncate">
              {experience.candidate?.degree || "B.Tech / B.E"}
              {experience.candidate?.cgpa && (
                <span className="ml-1 text-ox-muted font-mono font-normal">
                  ({experience.candidate.cgpa} CGPA)
                </span>
              )}
            </p>
            <p className="text-ox-muted truncate">
              {experience.candidate?.department || "Computer Science / IT"}
            </p>
          </div>

          {/* Compensation */}
          <div className="space-y-1">
            <span className="text-ox-muted flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" />
              Compensation
            </span>
            <p className="font-bold text-ox-signal-pass text-sm">
              {formatCTC(experience.compensation?.ctc)}
            </p>
            <p className="text-ox-muted">
              {experience.timeline?.month
                ? `${experience.timeline.month} ${experience.timeline.year || "2024"}`
                : "Campus Placement Drive"}
            </p>
          </div>

          {/* Process Stats */}
          <div className="space-y-1">
            <span className="text-ox-muted flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Process
            </span>
            <p className="font-semibold text-ox-ink font-mono tabular-nums">
              {rounds.length} {rounds.length === 1 ? "Round" : "Rounds"}
            </p>
            <p className="text-ox-muted">
              {rounds.map((r) => r.type.split("_")[0]).join(" → ") || "Sequential"}
            </p>
          </div>
        </div>
      </div>

      {/* Tab switcher: Rounds vs Full Transcript */}
      <div className="flex items-center gap-0 border-b border-ox-edge">
        <button
          onClick={() => setMainTab("rounds")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            mainTab === "rounds"
              ? "border-ox-accent text-ox-ink font-semibold"
              : "border-transparent text-ox-muted hover:text-ox-ink"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Interview rounds ({rounds.length})</span>
        </button>
        <button
          onClick={() => setMainTab("transcript")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            mainTab === "transcript"
              ? "border-ox-accent text-ox-ink font-semibold"
              : "border-transparent text-ox-muted hover:text-ox-ink"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Original Writeup</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {mainTab === "rounds" && (
        <div className="space-y-8">
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
                  className="group bg-ox-surface border border-ox-edge rounded-lg p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-ox-accent transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-md bg-ox-surface-raised flex items-center justify-center shrink-0">
                      {getRoundIcon(round.type)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base text-ox-ink truncate group-hover:text-ox-accent transition-colors">
                          {roundTitle}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-ox-surface-raised text-ox-muted capitalize border border-ox-edge">
                          {round.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ox-muted">
                        {round.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {round.duration}
                          </span>
                        )}
                        <span>{round.platform || round.mode || "In-person"}</span>
                        {round.questions && round.questions.length > 0 && (
                          <span className="font-mono">
                            {round.questions.length} questions
                          </span>
                        )}
                        {round.coding?.problems && round.coding.problems.length > 0 && (
                          <span className="font-mono text-ox-signal-pass">
                            {round.coding.problems.length} coding problems
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-ox-muted group-hover:text-ox-ink hidden sm:inline transition-colors">
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
            <div className="bg-ox-surface border border-ox-edge rounded-lg p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-ox-edge">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-ox-ink">Candidate advice</h2>
              </div>

              <div className="space-y-2.5 text-sm text-ox-ink/90 leading-relaxed">
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
