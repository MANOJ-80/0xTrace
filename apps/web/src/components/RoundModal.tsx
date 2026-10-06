"use client";

import { useEffect, useCallback, useState } from "react";
import { Round } from "@/lib/types";
import MarkdownRenderer from "./MarkdownRenderer";
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
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Tag,
  Flame,
} from "lucide-react";
import DocumentReader from "./DocumentReader";

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
    if (currentIndex > 0) onSelectIndex(currentIndex - 1);
  }, [currentIndex, onSelectIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalRounds - 1) onSelectIndex(currentIndex + 1);
  }, [currentIndex, totalRounds, onSelectIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
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

  const roundTitle = currentRound.name.includes("Round")
    ? currentRound.name.replace(/-/g, ":")
    : `Round ${currentRound.sequence}: ${currentRound.name}`;

  const narrativeContent = currentRound.description || currentRound.raw_content || "";

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

  const renderNarrative = (text: string) => {
    if (!text.trim()) {
      return <p className="text-ox-muted italic">No description recorded for this round.</p>;
    }
    const paragraphs = text.split("\n\n").filter((p) => p.trim());
    return paragraphs.map((para, pIdx) => {
      const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
      const isBulletList = lines.every((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*"));

      if (isBulletList) {
        return (
          <ul key={pIdx} className="space-y-1.5 my-2">
            {lines.map((l, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2 text-ox-ink text-sm leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-ox-muted shrink-0 mt-2" />
                <span>{l.replace(/^[•\-*]\s*/, "")}</span>
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="text-sm text-ox-ink leading-relaxed">
          {para}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-ox-surface border border-ox-edge rounded-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-ox-edge flex items-center justify-between bg-ox-void">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-ox-surface-raised flex items-center justify-center shrink-0">
              {getRoundIcon(currentRound.type)}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm text-ox-ink truncate">
                {roundTitle}
              </h2>
              <span className="text-xs text-ox-muted font-mono">
                {currentIndex + 1} of {totalRounds}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-md hover:bg-ox-surface-raised disabled:opacity-30 text-ox-muted transition-colors"
              title="Previous round"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === totalRounds - 1}
              className="p-1.5 rounded-md hover:bg-ox-surface-raised disabled:opacity-30 text-ox-muted transition-colors"
              title="Next round"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 ml-2 rounded-md hover:bg-ox-surface-raised text-ox-muted hover:text-ox-ink transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-ox-muted">
            <span className="capitalize font-medium text-ox-ink">
              {currentRound.type.replace(/_/g, " ")}
            </span>
            {currentRound.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentRound.duration}
              </span>
            )}
            {(currentRound.platform || currentRound.mode) && (
              <span>{currentRound.platform || currentRound.mode}</span>
            )}
            {currentRound.difficulty && (
              <span className="flex items-center gap-1 text-ox-signal-warn capitalize">
                <Flame className="w-3 h-3" />
                {currentRound.difficulty}
              </span>
            )}
          </div>

          {/* Narrative */}
          <div className="bg-ox-void border border-ox-edge rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ox-muted flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Round walkthrough
              </span>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-ox-surface-raised text-ox-muted transition-colors"
                title="Copy raw text"
              >
                {copied ? <Check className="w-3 h-3 text-ox-signal-pass" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="space-y-2 pt-1">
              <MarkdownRenderer source={narrativeContent} />
            </div>
          </div>

          {/* Questions */}
          {normalizedQuestions.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-ox-muted">
                Questions asked ({normalizedQuestions.length})
              </span>
              <div className="space-y-2">
                {normalizedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-ox-edge bg-ox-void text-sm space-y-1.5"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-ox-surface-raised text-ox-muted text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                        {idx + 1}
                      </span>
                      <p className="font-medium text-ox-ink leading-snug">
                        {q.question}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 pl-7 flex-wrap">
                      {q.topic && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-accent/10 text-ox-accent border border-ox-accent/20 font-medium flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          {q.topic}
                        </span>
                      )}
                      {q.difficulty && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-surface-raised text-ox-muted capitalize font-medium">
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                    {q.details && (
                      <p className="text-xs text-ox-muted leading-relaxed pl-7">{q.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coding problems */}
          {normalizedCoding.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-ox-muted">
                Coding challenges ({normalizedCoding.length})
              </span>
              <div className="space-y-2">
                {normalizedCoding.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-ox-edge bg-ox-void space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-ox-signal-pass/10 text-ox-signal-pass flex items-center justify-center font-bold text-xs font-mono">
                          P{idx + 1}
                        </span>
                        <h4 className="font-semibold text-sm text-ox-ink">{p.title}</h4>
                      </div>
                      {p.difficulty && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-signal-warn/10 text-ox-signal-warn font-medium capitalize shrink-0">
                          {p.difficulty}
                        </span>
                      )}
                    </div>

                    {p.description && p.description !== p.title && (
                      <p className="text-xs text-ox-ink/70 leading-relaxed whitespace-pre-line bg-ox-surface p-3 rounded-md border border-ox-edge font-mono">
                        {p.description}
                      </p>
                    )}

                    {p.topics && p.topics.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        {p.topics.map((tag: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-signal-pass/10 text-ox-signal-pass/80 border border-ox-signal-pass/20"
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

          {/* Raw source accordion */}
          <div className="border border-ox-edge rounded-lg overflow-hidden">
            <button
              onClick={() => setShowRawSource(!showRawSource)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-ox-muted hover:text-ox-ink transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Verbatim source text</span>
              </div>
              {showRawSource ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showRawSource && (
              <div className="p-4 border-t border-ox-edge bg-ox-void">
                <DocumentReader
                  content={currentRound.raw_content || ""}
                  title={`${roundTitle} transcript`}
                  subtitle="Original text preserved exactly"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-ox-edge bg-ox-void flex items-center justify-between text-xs text-ox-muted">
          <span>Arrow keys to navigate</span>
          <div className="flex items-center gap-1.5">
            {rounds.map((_, i) => (
              <button
                key={i}
                onClick={() => onSelectIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentIndex
                    ? "bg-ox-accent w-3"
                    : "bg-ox-edge hover:bg-ox-muted"
                }`}
                title={`Round ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
