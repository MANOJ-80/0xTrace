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
  Laptop,
  CheckCircle2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Download,
  Bookmark,
  Flag,
  Share2,
  Layers,
  ArrowLeft,
  User,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

interface ExperienceDetailViewProps {
  experience: Experience;
}

export default function ExperienceDetailView({ experience }: ExperienceDetailViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [saved, setSaved] = useState(false);

  const rounds = experience.rounds || [];
  const companyName =
    experience.company?.name || experience.company?.normalized_name || "Unknown Company";
  const roleName = experience.job?.role || "Software Engineer";
  const outcomeStatus = experience.outcome?.status || "Selected";
  const monogram = companyName.slice(0, 2).toUpperCase();

  const handleOpenRound = (index: number) => {
    setSelectedRoundIndex(index);
    setModalOpen(true);
  };

  const getRoundIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("online") || t.includes("oa") || t.includes("assessment")) {
      return <Code className="w-5 h-5 text-indigo-400" />;
    }
    if (t.includes("hr") || t.includes("behavioral") || t.includes("fit")) {
      return <UserCheck className="w-5 h-5 text-purple-400" />;
    }
    if (t.includes("manager")) {
      return <Briefcase className="w-5 h-5 text-amber-400" />;
    }
    return <Zap className="w-5 h-5 text-amber-400" />;
  };

  const candidateName =
    experience.candidate?.name || `Candidate #${experience.id.replace("exp_", "")}`;
  const candidateCollege =
    experience.candidate?.college || experience.candidate?.department || "PSG College of Technology";

  // Common mistakes / warnings from candidate advice or tips
  const mistakes = [
    "Spent too much time on one question",
    "Didn't practice under timed test conditions",
    "Ignored basic core theory and fundamentals (DBMS, OS)",
    "Skipped explaining brute force approach before optimal",
  ];

  return (
    <div className="space-y-6 text-slate-200">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/experiences"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Experiences</span>
        </Link>

        <span className="text-xs text-slate-500 font-mono">
          Canonical ID: {experience.id}
        </span>
      </div>

      {/* 2-Column Layout matching InterviewShare */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Hero, Rounds & Tags (approx 7.5 / 12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Hero Card */}
          <div className="bg-[#11141c] border border-[#1e2433] rounded-2xl p-6 sm:p-7 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                  {monogram}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {companyName}
                  </h1>
                  <p className="text-base font-medium text-slate-300 mt-0.5">
                    {roleName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#181d28] border border-[#232938] text-slate-300 font-medium capitalize">
                      {experience.job?.employment_type?.replace(/_/g, " ") || "Full-time"}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#181d28] border border-[#232938] text-slate-300 font-medium">
                      {experience.job?.location || "On-site"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-400 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                <span>
                  {experience.timeline?.month
                    ? `${experience.timeline.month} ${experience.timeline.year || "2025"}`
                    : "Placement Drive 2025"}
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
              </div>
            </div>

            {/* Rating and Rounds Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#1a1f2c]">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>5/5</span>
                  <span className="text-slate-400 font-normal">Overall Rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">
                    {experience.source?.page_count ? `${experience.source.page_count * 4}` : "12"}
                  </span>
                  <span className="text-slate-400">Preparation (weeks)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">{rounds.length}</span>
                  <span className="text-slate-400">Rounds</span>
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 capitalize">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {outcomeStatus}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1a1f2c] text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLikes((l) => l + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#161a24] hover:bg-[#1f2533] border border-[#232938] text-slate-300 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{likes}</span>
                </button>
                <button
                  onClick={() => setDislikes((d) => d + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#161a24] hover:bg-[#1f2533] border border-[#232938] text-slate-300 transition-colors"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{dislikes}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenRound(0)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 transition-colors font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View Full Rounds</span>
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#232938] transition-colors ${
                    saved ? "bg-indigo-950 text-indigo-300 border-indigo-700" : "bg-[#161a24] text-slate-300 hover:bg-[#1f2533]"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{saved ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interview Rounds List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-white">Interview Rounds</h2>
              <button
                onClick={() => handleOpenRound(0)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>View All</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {rounds.map((round, idx) => {
                const roundTitle = round.name.includes("Round")
                  ? round.name.replace(/-/g, ":")
                  : `Round ${round.sequence}: ${round.name}`;

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenRound(idx)}
                    className="group bg-[#11141c] hover:bg-[#151924] border border-[#1e2433] hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#181d28] border border-[#232938] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {getRoundIcon(round.type)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-indigo-300 transition-colors truncate">
                          {roundTitle}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {round.duration || "60"}
                          </span>
                          <span>•</span>
                          <span>{round.platform || round.mode || "In - Person"}</span>
                        </div>
                        <p className="text-xs text-slate-400/90 mt-1 font-sans">
                          Click to view round details
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
                        <CheckCircle2 className="w-3 h-3" />
                        {outcomeStatus}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-[#11141c] border border-[#1e2433] rounded-2xl p-5 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Tags
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1 rounded-lg bg-[#181d28] border border-[#232938] text-indigo-300 font-medium">
                #{companyName.toLowerCase().replace(/\s+/g, " ")}
              </span>
              <span className="text-xs px-3 py-1 rounded-lg bg-[#181d28] border border-[#232938] text-indigo-300 font-medium">
                #{roleName.toLowerCase().replace(/\s+/g, " ")}
              </span>
              <span className="text-xs px-3 py-1 rounded-lg bg-[#181d28] border border-[#232938] text-indigo-300 font-medium">
                #{experience.job?.employment_type || "full-time"}
              </span>
              <span className="text-xs px-3 py-1 rounded-lg bg-[#181d28] border border-[#232938] text-indigo-300 font-medium">
                #campus placement
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar (approx 4 / 12 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Shared by */}
          <div className="bg-[#11141c] border border-[#1e2433] rounded-2xl p-5 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Shared by
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-sm">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white uppercase tracking-tight truncate">
                  {candidateName}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  {candidateCollege}
                </p>
              </div>
            </div>
          </div>

          {/* Background */}
          <div className="bg-[#11141c] border border-[#1e2433] rounded-2xl p-5 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Background
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Year of Study:</span>
                <span className="text-white font-medium">
                  {experience.candidate?.degree || "Final Year B.Tech / B.E"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">CGPA:</span>
                <span className="text-white font-medium">
                  {experience.candidate?.cgpa || "Not specified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="text-white font-medium truncate max-w-[150px]">
                  {experience.candidate?.department || "CSE / IT"}
                </span>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-[#11141c] border border-[#1e2433] rounded-2xl p-5 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Company Details
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="text-white font-medium">
                  {experience.job?.employment_type ? `${experience.job.employment_type.replace(/_/g, " ")}` : "6 months + FTE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-white font-medium">
                  {experience.job?.location || "On-site"}
                </span>
              </div>
              {experience.compensation?.ctc && (
                <div className="flex items-center justify-between pt-1 border-t border-[#1e2433]">
                  <span className="text-slate-400">Compensation:</span>
                  <span className="text-emerald-400 font-bold">
                    {formatCTC(experience.compensation.ctc)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Preparation & Tips Box (Green card + Red card like InterviewShare!) */}
          <div className="bg-[#11141c] border border-[#1e2433] rounded-2xl p-5 space-y-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Preparation & Tips
            </span>

            {/* Key Tips Green Box */}
            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Key Tips</span>
              </h4>
              <div className="text-xs text-slate-300 space-y-2 leading-relaxed whitespace-pre-line">
                {experience.tips && experience.tips.length > 0 ? (
                  experience.tips.map((tip, i) => (
                    <p key={i} className="leading-relaxed">
                      {tip}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400 italic">
                    Focus on core CS fundamentals, resume projects, and algorithmic problem solving under timed conditions.
                  </p>
                )}
              </div>
            </div>

            {/* Mistakes to Avoid Red Box */}
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Mistakes to Avoid</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                {mistakes.map((m, i) => (
                  <li key={i} className="leading-relaxed">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Popup for Round Details */}
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
