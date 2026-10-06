"use client";

import { useState } from "react";
import { Round } from "@/lib/types";
import MarkdownRenderer from "./MarkdownRenderer";
import { getRoundTypeBadgeColor } from "@/lib/utils";
import {
  Clock,
  Flame,
  Code2,
  FileText,
  Tag,
  Lightbulb,
} from "lucide-react";
import DocumentReader from "./DocumentReader";

interface RoundViewerProps {
  rounds: Round[];
}

export default function RoundViewer({ rounds }: RoundViewerProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"walkthrough" | "questions" | "coding" | "raw">("walkthrough");

  if (!rounds || rounds.length === 0) {
    return (
      <div className="p-8 text-center bg-ox-surface rounded-lg border border-ox-edge text-ox-muted text-sm">
        No interview rounds recorded for this experience.
      </div>
    );
  }

  const currentRound = rounds[selectedIdx] || rounds[0];

  const questions = (currentRound.questions || []).map((q: any) => {
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

  const codingProblems = (currentRound.coding?.problems || []).map((p: any) => {
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

  const narrative = currentRound.description || currentRound.raw_content || "";

  return (
    <div className="bg-ox-surface rounded-lg border border-ox-edge overflow-hidden">
      {/* Round navigation */}
      <div className="border-b border-ox-edge bg-ox-void p-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {rounds.map((r, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-ox-accent text-white"
                    : "bg-ox-surface text-ox-muted border border-ox-edge hover:border-ox-accent hover:text-ox-ink"
                }`}
              >
                <span className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? "bg-white/20" : "bg-ox-surface-raised"
                }`}>
                  {r.sequence}
                </span>
                <span>{r.name || `Round ${r.sequence}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Round header */}
      <div className="p-5 border-b border-ox-edge">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-ox-ink">{currentRound.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${getRoundTypeBadgeColor(currentRound.type)}`}>
                {currentRound.type.replace(/_/g, " ")}
              </span>
            </div>
            {currentRound.original_name && currentRound.original_name !== currentRound.name && (
              <p className="text-xs text-ox-muted mt-1">
                Source: <span className="font-mono text-ox-ink/70">"{currentRound.original_name}"</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {currentRound.duration && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-ox-surface-raised text-ox-muted">
                <Clock className="w-3 h-3" />
                {currentRound.duration}
              </span>
            )}
            {currentRound.difficulty && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-ox-surface-raised text-ox-signal-warn capitalize">
                <Flame className="w-3 h-3" />
                {currentRound.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Content tabs */}
        <div className="flex items-center gap-0 mt-4 border-b border-ox-edge">
          {([
            { key: "walkthrough", label: "Walkthrough", icon: Lightbulb },
            { key: "questions", label: `Questions (${questions.length})`, icon: null },
            { key: "coding", label: `Coding (${codingProblems.length})`, icon: Code2 },
            { key: "raw", label: "Verbatim source", icon: FileText },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 pb-2 px-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-ox-accent text-ox-ink"
                  : "border-transparent text-ox-muted hover:text-ox-ink"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="p-5">
        {activeTab === "walkthrough" && (
          <div className="space-y-3">
            <div className="bg-ox-void border border-ox-edge rounded-lg p-4 space-y-2">
              <span className="text-xs font-medium text-ox-muted flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Round walkthrough
              </span>
              <div className="space-y-2 text-sm text-ox-ink leading-relaxed prose prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">
                {narrative ? (
                  <MarkdownRenderer source={narrative} />
                ) : (
                  <p className="text-ox-muted italic">No narrative recorded for this round.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "questions" && (
          <div>
            {questions.length === 0 ? (
              <div className="text-center py-10 text-ox-muted text-sm">
                No questions tagged for this round. Check the walkthrough or verbatim source.
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-ox-edge bg-ox-void">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-sm bg-ox-surface-raised text-ox-muted text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-ox-ink leading-snug">{q.question}</p>
                        {q.details && (
                          <p className="text-xs text-ox-muted leading-relaxed">{q.details}</p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {q.topic && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-accent/10 text-ox-accent border border-ox-accent/20 font-medium flex items-center gap-0.5">
                              <Tag className="w-2.5 h-2.5" />
                              {q.topic}
                            </span>
                          )}
                          {q.difficulty && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-surface-raised text-ox-muted capitalize">
                              {q.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "coding" && (
          <div>
            {codingProblems.length === 0 ? (
              <div className="text-center py-10 text-ox-muted text-sm">
                No coding problems listed for this round.
              </div>
            ) : (
              <div className="space-y-3">
                {codingProblems.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-ox-edge bg-ox-void space-y-2">
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
                      <p className="text-xs text-ox-ink/70 whitespace-pre-line leading-relaxed bg-ox-surface p-3 rounded-md border border-ox-edge">
                        {p.description}
                      </p>
                    )}

                    {p.topics && p.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.topics.map((tag: string, tIdx: number) => (
                          <span key={tIdx} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-signal-pass/10 text-ox-signal-pass/80 border border-ox-signal-pass/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "raw" && (
          <DocumentReader
            content={currentRound.raw_content || ""}
            title={`${currentRound.name} transcript`}
            subtitle="Original text preserved exactly"
          />
        )}
      </div>
    </div>
  );
}
