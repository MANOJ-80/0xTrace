"use client";

import { useEffect, useCallback } from "react";
import { Round } from "@/lib/types";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Code,
  Zap,
  UserCheck,
  Briefcase,
  Lightbulb,
  Clock,
  MapPin,
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  Star,
  Layers,
} from "lucide-react";
import { useState } from "react";

interface RoundModalProps {
  rounds: Round[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  outcomeStatus?: string | null;
}

export default function RoundModal({
  rounds,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  outcomeStatus = "Selected",
}: RoundModalProps) {
  const [copied, setCopied] = useState(false);

  const currentRound = rounds[currentIndex] || rounds[0];
  const totalRounds = rounds.length;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onSelectIndex(currentIndex - 1);
    }
  }, [currentIndex, onSelectIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalRounds - 1) {
      onSelectIndex(currentIndex + 1);
    }
  }, [currentIndex, totalRounds, onSelectIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentRound) return null;

  const handleCopyText = () => {
    if (currentRound.raw_content) {
      navigator.clipboard.writeText(currentRound.raw_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get icon by round type
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

  // Format round title (e.g. "Round 2: Technical")
  const roundTitle = currentRound.name.includes("Round")
    ? currentRound.name.replace(/-/g, ":")
    : `Round ${currentRound.sequence}: ${currentRound.name}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-[#11141c] border border-[#232938] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1e2433] flex items-center justify-between bg-[#0e1017]">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base sm:text-lg text-white">
              {roundTitle}
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {currentIndex + 1} of {totalRounds}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors"
              title="Previous Round (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === totalRounds - 1}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors"
              title="Next Round (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 ml-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close (Escape)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Sub-header with icon & badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center shrink-0">
                {getRoundIcon(currentRound.type)}
              </div>
              <div>
                <h3 className="font-bold text-base text-white capitalize">
                  {currentRound.type.replace(/_/g, " ")}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {currentRound.duration || "60 minutes"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    {currentRound.platform || currentRound.mode || "In - Person"}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    5/5
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {outcomeStatus || "Selected"}
              </span>
            </div>
          </div>

          {/* Full PDF Text for that round in neat format */}
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/15 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Round Experience & Questions (Verbatim from PDF)</span>
              </div>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/50 hover:bg-amber-900/50 text-amber-300 text-[11px] border border-amber-800/40 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Formatted Text Content */}
            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans space-y-2 selection:bg-amber-500/30 selection:text-white">
              {currentRound.raw_content ? (
                currentRound.raw_content
              ) : (
                <p className="text-slate-400 italic">No description recorded for this round.</p>
              )}
            </div>
          </div>

          {/* Discrete Questions if Extracted */}
          {currentRound.questions && currentRound.questions.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Extracted Questions ({currentRound.questions.length})</span>
              </div>
              <div className="space-y-2">
                {currentRound.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[#1e2433] bg-[#161a24] text-xs space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-100">{q.question}</p>
                      {q.topic && (
                        <span className="px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 shrink-0 font-medium text-[10px]">
                          {q.topic}
                        </span>
                      )}
                    </div>
                    {q.details && (
                      <p className="text-slate-400 leading-relaxed text-[11px]">{q.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coding Problems if Extracted */}
          {currentRound.coding?.problems && currentRound.coding.problems.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <Code className="w-3.5 h-3.5" />
                <span>Coding Challenges ({currentRound.coding.problems.length})</span>
              </div>
              <div className="space-y-2">
                {currentRound.coding.problems.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#1e2433] bg-[#161a24] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100">{p.title}</h4>
                      {p.difficulty && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60 capitalize">
                          {p.difficulty}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {p.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#1e2433] bg-[#0e1017] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span className="text-[11px]">Use arrow keys or buttons to navigate between rounds</span>
          <div className="flex items-center gap-2">
            <span>
              {currentIndex + 1} of {totalRounds}
            </span>
            <div className="flex items-center gap-1">
              {rounds.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onSelectIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex
                      ? "bg-indigo-400 w-4"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                  title={`Go to Round ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
