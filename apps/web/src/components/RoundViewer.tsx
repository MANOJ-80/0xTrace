"use client";

import { useState } from "react";
import { Round } from "@/lib/types";
import { getRoundTypeBadgeColor } from "@/lib/utils";
import {
  Clock,
  Laptop,
  Flame,
  HelpCircle,
  Code2,
  FileText,
  Copy,
  Check,
  Tag,
  AlignLeft,
} from "lucide-react";

interface RoundViewerProps {
  rounds: Round[];
}

export default function RoundViewer({ rounds }: RoundViewerProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"questions" | "coding" | "raw">("questions");
  const [copied, setCopied] = useState(false);

  if (!rounds || rounds.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
        No interview rounds recorded for this experience.
      </div>
    );
  }

  const currentRound = rounds[selectedIdx] || rounds[0];
  const questions = currentRound.questions || [];
  const codingProblems = currentRound.coding?.problems || [];

  const handleCopyRaw = () => {
    if (currentRound.raw_content) {
      navigator.clipboard.writeText(currentRound.raw_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Round Navigation Stepper */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3 sm:p-4 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {rounds.map((r, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedIdx(idx);
                  // Auto pick tab with content
                  if (activeTab === "questions" && (r.questions?.length || 0) === 0 && (r.coding?.problems?.length || 0) > 0) {
                    setActiveTab("coding");
                  } else if (activeTab === "coding" && (r.coding?.problems?.length || 0) === 0 && (r.questions?.length || 0) > 0) {
                    setActiveTab("questions");
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {r.sequence}
                </span>
                <span>{r.name || `Round ${r.sequence}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Round Header Details */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {currentRound.name}
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border capitalize ${getRoundTypeBadgeColor(
                  currentRound.type
                )}`}
              >
                {currentRound.type.replace(/_/g, " ")}
              </span>
            </div>
            {currentRound.original_name && currentRound.original_name !== currentRound.name && (
              <p className="text-xs text-slate-400 mt-1">
                Source heading: <span className="font-mono text-slate-600 dark:text-slate-300">"{currentRound.original_name}"</span>
              </p>
            )}
            {currentRound.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                {currentRound.description}
              </p>
            )}
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {currentRound.duration && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                {currentRound.duration}
              </span>
            )}
            {currentRound.platform && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Laptop className="w-3.5 h-3.5 text-blue-500" />
                {currentRound.platform}
              </span>
            )}
            {currentRound.difficulty && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                {currentRound.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Content Navigation Sub-tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("questions")}
            className={`flex items-center gap-1.5 pb-2.5 px-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === "questions"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Questions ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("coding")}
            className={`flex items-center gap-1.5 pb-2.5 px-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === "coding"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Coding Problems ({codingProblems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("raw")}
            className={`flex items-center gap-1.5 pb-2.5 px-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === "raw"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Verbatim Source Text</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Tab 1: Questions */}
        {activeTab === "questions" && (
          <div>
            {questions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No discrete interview questions tagged for this round. Check the verbatim source text tab for full details.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-1">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                            {q.question}
                          </p>
                          {q.details && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                              {q.details}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {q.topic && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-medium flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {q.topic}
                          </span>
                        )}
                        {q.category && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {q.category}
                          </span>
                        )}
                        {q.difficulty && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 capitalize">
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Coding Problems */}
        {activeTab === "coding" && (
          <div>
            {codingProblems.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No distinct DSA/coding problems listed for this round.
              </div>
            ) : (
              <div className="grid gap-4">
                {codingProblems.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                          P{idx + 1}
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                          {p.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.difficulty && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 capitalize">
                            {p.difficulty}
                          </span>
                        )}
                        {p.platform && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {p.platform}
                          </span>
                        )}
                      </div>
                    </div>

                    {p.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-white dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-700/60 font-sans">
                        {p.description}
                      </p>
                    )}

                    {p.topics && p.topics.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs text-slate-400 font-medium mr-1">Tags:</span>
                        {p.topics.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          >
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

        {/* Tab 3: Verbatim Source Content */}
        {activeTab === "raw" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <AlignLeft className="w-3.5 h-3.5" />
                Original raw content preserved directly from PDF source spans:
              </span>
              <button
                onClick={handleCopyRaw}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Raw"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap selection:bg-indigo-500 selection:text-white border border-slate-800">
              {currentRound.raw_content || "(No raw content preserved for this round)"}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
