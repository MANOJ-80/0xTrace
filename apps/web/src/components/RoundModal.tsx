"use client";

import { useEffect, useCallback, useState } from "react";
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
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  Star,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode2,
  HelpCircle,
  Tag,
  Flame,
} from "lucide-react";

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
  const [showRawSource, setShowRawSource] = useState(false);

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
    if (t.includes("online") || t.includes("oa") || t.includes("assessment") || t.includes("coding")) {
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

  // Format round title (e.g. "Round 2: Technical Interview")
  const roundTitle = currentRound.name.includes("Round")
    ? currentRound.name.replace(/-/g, ":")
    : `Round ${currentRound.sequence}: ${currentRound.name}`;

  // Use cleaned description if present, else fallback to raw_content
  const narrativeContent = currentRound.description || currentRound.raw_content || "";

  // Normalize questions (handles both object and string shapes)
  const normalizedQuestions = (currentRound.questions || []).map((q: any) => {
    if (typeof q === "string") {
      return { question: q, topic: "Core CS", difficulty: "medium", category: "technical" };
    }
    return {
      question: q.question || "",
      topic: q.topic || "Core CS",
      difficulty: q.difficulty || "medium",
      category: q.category || "technical",
      details: q.details || null,
    };
  }).filter((q) => q.question.trim().length > 0);

  // Normalize coding problems (handles both object and string shapes)
  const normalizedCoding = (currentRound.coding?.problems || []).map((p: any) => {
    if (typeof p === "string") {
      return { title: p.slice(0, 80), description: p, difficulty: "medium", topics: ["Algorithms"] };
    }
    return {
      title: p.title || "Coding Problem",
      description: p.description || p.title || "",
      difficulty: p.difficulty || "medium",
      topics: p.topics || [],
    };
  });

  // Render narrative with formatted paragraphs and bullet items
  const renderNarrativeBlocks = (text: string) => {
    if (!text.trim()) {
      return <p className="text-slate-400 italic">No description recorded for this round.</p>;
    }

    const paragraphs = text.split("\n\n").filter((p) => p.trim());
    return paragraphs.map((para, pIdx) => {
      const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
      const isBulletList = lines.every((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*"));

      if (isBulletList) {
        return (
          <ul key={pIdx} className="space-y-1.5 my-2">
            {lines.map((l, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2 text-slate-200 text-sm leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                <span>{l.replace(/^[•\-*]\s*/, "")}</span>
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="text-sm text-slate-200 leading-relaxed font-sans selection:bg-indigo-500/30">
          {para}
        </p>
      );
    });
  };

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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Sub-header with icon & badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e2433]">
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
                    {currentRound.platform || currentRound.mode || "In-Person"}
                  </span>
                  {currentRound.difficulty && (
                    <span className="flex items-center gap-1 text-amber-400 capitalize">
                      <Flame className="w-3.5 h-3.5" />
                      {currentRound.difficulty}
                    </span>
                  )}
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

          {/* Clean Round Narrative Card */}
          <div className="rounded-xl border border-[#232938] bg-[#141824] p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Round Walkthrough & Experience</span>
              </div>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e2433] hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                title="Copy raw round text"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Formatted Clean Text Content */}
            <div className="space-y-2.5 pt-1">
              {renderNarrativeBlocks(narrativeContent)}
            </div>
          </div>

          {/* Discrete Questions Section */}
          {normalizedQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Interview Questions Asked ({normalizedQuestions.length})</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {normalizedQuestions.length} item{normalizedQuestions.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid gap-2.5">
                {normalizedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#1e2433] bg-[#161a24] hover:border-indigo-900/50 transition-colors text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="font-semibold text-slate-100 text-sm leading-snug">
                          {q.question}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {q.topic && (
                          <span className="px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 shrink-0 font-medium text-[10px] flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {q.topic}
                          </span>
                        )}
                        {q.difficulty && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0 font-medium text-[10px] capitalize">
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                    </div>

                    {q.details && (
                      <p className="text-slate-400 leading-relaxed text-xs pl-7">
                        {q.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coding Problems Section */}
          {normalizedCoding.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  <Code className="w-4 h-4" />
                  <span>Coding & DSA Challenges ({normalizedCoding.length})</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {normalizedCoding.length} problem{normalizedCoding.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid gap-3">
                {normalizedCoding.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#1e2433] bg-[#161a24] hover:border-emerald-900/50 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center justify-center font-bold text-xs">
                          P{idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-100">
                          {p.title}
                        </h4>
                      </div>

                      {p.difficulty && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60 capitalize shrink-0">
                          {p.difficulty}
                        </span>
                      )}
                    </div>

                    {p.description && p.description !== p.title && (
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-[#0e1017] p-3 rounded-lg border border-slate-800/80 font-sans">
                        {p.description}
                      </p>
                    )}

                    {p.topics && p.topics.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] text-slate-500 font-medium mr-1">Tags:</span>
                        {p.topics.map((tag: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lossless Untouched Raw Source Accordion */}
          <div className="border border-[#1e2433] rounded-xl overflow-hidden bg-[#0d0f16]">
            <button
              onClick={() => setShowRawSource(!showRawSource)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-slate-500" />
                <span>View Untouched Raw Spans (Lossless Audit)</span>
              </div>
              {showRawSource ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showRawSource && (
              <div className="p-4 border-t border-[#1e2433] space-y-2 bg-[#0a0c12]">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Exact characters extracted directly from PDF source stream:</span>
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy Raw"}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-[#050608] text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap border border-slate-800">
                  {currentRound.raw_content || "(No raw source content recorded)"}
                </pre>
              </div>
            )}
          </div>
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
