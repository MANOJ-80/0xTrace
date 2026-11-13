"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Edit,
  Flag,
  Trash2,
} from "lucide-react";
import DocumentReader from "./DocumentReader";

interface ExperienceDetailViewProps {
  experience: Experience;
}

export default function ExperienceDetailView({ experience }: ExperienceDetailViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);
  const [mainTab, setMainTab] = useState<"rounds" | "transcript">("rounds");
  const [deleting, setDeleting] = useState(false);

  const rounds = experience.rounds || [];
  const companyName =
    experience.company?.name || experience.company?.normalized_name || "Unknown Company";
  const roleName = experience.job?.role || "Software Engineer";
  const outcomeStatus = experience.outcome?.status || "Selected";

  const userEmail = session?.user?.email?.toLowerCase();
  const isAuthor =
    experience.author?.email &&
    experience.author.email.toLowerCase() === userEmail;
  const isAdmin = !!session?.user?.isAdmin;
  const canManage = isAuthor || isAdmin;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this experience? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/experiences/${experience._id || experience.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      router.push("/my-experiences");
    } catch (err: any) {
      alert(`Error deleting experience: ${err.message}`);
      setDeleting(false);
    }
  };

  const handleOpenRound = (index: number) => {
    setSelectedRoundIndex(index);
    setModalOpen(true);
  };

  const getRoundIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("online") || t.includes("oa") || t.includes("assessment")) {
      return <Code className="w-4 h-4 text-ox-accent" />;
    }
    if (t.includes("hr") || t.includes("behavioral") || t.includes("fit")) {
      return <UserCheck className="w-4 h-4 text-ox-accent" />;
    }
    if (t.includes("manager")) {
      return <Briefcase className="w-4 h-4 text-ox-accent" />;
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

        <div className="flex items-center gap-3">
          {canManage && (
            <div className="flex items-center gap-2">
              <Link
                href={`/experiences/${experience._id || experience.id}/edit`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ox-ink bg-ox-surface border border-ox-edge hover:border-ox-accent rounded transition-colors"
              >
                <Edit className="w-3.5 h-3.5 text-ox-accent" />
                <span>Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-400 bg-ox-surface border border-ox-edge hover:border-red-500 rounded transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          )}
          <Link
            href={`/contact?type=removal&record=${encodeURIComponent(
              `/experiences/${experience._id || experience.id}`
            )}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ox-muted bg-ox-surface border border-ox-edge hover:border-ox-accent hover:text-ox-ink rounded transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report or request removal</span>
          </Link>
          <span className="text-xs text-ox-muted font-mono">
            {experience.id}
          </span>
        </div>
      </div>

      {/* Unified Comprehensive Header Card */}
      <div className="experience-detail-header ui-panel p-5 sm:p-6 space-y-5">
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
            className={`inline-flex items-center px-3 py-1 text-[10px] font-semibold capitalize shrink-0 ${getOutcomeBadgeColor(
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
      <div className="segmented-control" role="group" aria-label="Experience content">
        <button
          onClick={() => setMainTab("rounds")}
          aria-pressed={mainTab === "rounds"}
          className={`segment-button flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            mainTab === "rounds"
              ? "text-ox-ink font-semibold"
              : "text-ox-muted hover:text-ox-ink"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Interview rounds ({rounds.length})</span>
        </button>
        <button
          onClick={() => setMainTab("transcript")}
          aria-pressed={mainTab === "transcript"}
          className={`segment-button flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            mainTab === "transcript"
              ? "text-ox-ink font-semibold"
              : "text-ox-muted hover:text-ox-ink"
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
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleOpenRound(idx)}
                  className="round-list-item group flex items-center justify-between gap-4 text-left w-full"
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
                      <div className="flex items-center gap-3 text-xs text-ox-muted flex-wrap">
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
                </button>
              );
            })}
          </div>

          {/* Candidate Advice (combined tips + pitfalls) */}
          {((experience.tips && experience.tips.length > 0) || mistakes.length > 0) && (
            <div className="bg-ox-surface border border-ox-edge rounded-lg p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-ox-edge">
                <Lightbulb className="w-4 h-4 text-ox-accent" />
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
