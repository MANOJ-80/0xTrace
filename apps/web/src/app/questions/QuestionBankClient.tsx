"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { InterviewQuestion, CodingProblem } from "@/lib/types";
import { Search, Code2, ArrowRight, X, MessageSquare } from "lucide-react";

interface EnrichedQuestion extends InterviewQuestion {
  company: string;
  role: string;
  experienceId: string;
  roundName: string;
}

interface EnrichedProblem extends CodingProblem {
  company: string;
  role: string;
  experienceId: string;
  roundName: string;
}

interface QuestionBankClientProps {
  questions: EnrichedQuestion[];
  codingProblems: EnrichedProblem[];
  companies: string[];
}

export default function QuestionBankClient({
  questions,
  codingProblems,
  companies,
}: QuestionBankClientProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "coding">("questions");
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const text = (q.question || "").toLowerCase();
        const topic = (q.topic || "").toLowerCase();
        const category = (q.category || "").toLowerCase();
        const comp = (q.company || "").toLowerCase();
        if (!text.includes(query) && !topic.includes(query) && !category.includes(query) && !comp.includes(query)) {
          return false;
        }
      }
      if (selectedCompany && selectedCompany !== "all") {
        if (q.company.toLowerCase() !== selectedCompany.toLowerCase()) return false;
      }
      if (selectedDifficulty !== "all") {
        if ((q.difficulty || "").toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
      }
      return true;
    });
  }, [questions, search, selectedCompany, selectedDifficulty]);

  const filteredProblems = useMemo(() => {
    return codingProblems.filter((p) => {
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const title = (p.title || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const comp = (p.company || "").toLowerCase();
        const topics = (p.topics || []).map((t) => t.toLowerCase()).join(" ");
        if (!title.includes(query) && !desc.includes(query) && !comp.includes(query) && !topics.includes(query)) {
          return false;
        }
      }
      if (selectedCompany && selectedCompany !== "all") {
        if (p.company.toLowerCase() !== selectedCompany.toLowerCase()) return false;
      }
      if (selectedDifficulty !== "all") {
        if ((p.difficulty || "").toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
      }
      return true;
    });
  }, [codingProblems, search, selectedCompany, selectedDifficulty]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Tab switcher — touch scrollable */}
      <div className="flex items-center gap-1 border-b border-ox-edge overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap min-h-[44px] transition-colors ${
            activeTab === "questions"
              ? "border-ox-accent text-ox-ink font-semibold"
              : "border-transparent text-ox-muted hover:text-ox-ink"
          }`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>Interview questions ({questions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("coding")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap min-h-[44px] transition-colors ${
            activeTab === "coding"
              ? "border-ox-accent text-ox-ink font-semibold"
              : "border-transparent text-ox-muted hover:text-ox-ink"
          }`}
        >
          <Code2 className="w-4 h-4 shrink-0" />
          <span>Coding problems ({codingProblems.length})</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-ox-surface border border-ox-edge rounded-xl p-3.5 sm:p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ox-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === "questions"
                  ? "Search by topic, keyword, or company..."
                  : "Search coding by title, algorithm, or company..."
              }
              className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-ox-edge bg-ox-void text-xs sm:text-sm text-ox-ink placeholder:text-ox-muted focus:outline-none focus:ring-2 focus:ring-ox-accent/30 focus:border-ox-accent min-h-[42px] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ox-muted hover:text-ox-ink"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full sm:w-56 shrink-0 py-2.5 px-3 rounded-lg border border-ox-edge bg-ox-void text-xs sm:text-sm text-ox-ink font-medium focus:outline-none focus:ring-2 focus:ring-ox-accent/30 appearance-none min-h-[42px]"
          >
            <option value="">All companies ({companies.length})</option>
            {companies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ox-edge/60 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-ox-muted font-medium text-[11px] sm:text-xs">Difficulty:</span>
            {["all", "easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold capitalize min-h-[32px] transition-colors ${
                  selectedDifficulty === diff
                    ? "bg-ox-accent text-white"
                    : "text-ox-muted hover:text-ox-ink hover:bg-ox-surface-raised"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <span className="text-ox-muted font-mono text-[11px]">
            Showing{" "}
            <strong className="text-ox-ink tabular-nums">
              {activeTab === "questions" ? filteredQuestions.length : filteredProblems.length}
            </strong>{" "}
            results
          </span>
        </div>
      </div>

      {/* Questions list */}
      {activeTab === "questions" && (
        <div className="space-y-2.5 sm:space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16 bg-ox-surface/50 border border-ox-edge rounded-xl text-ox-muted text-sm p-6">
              No interview questions match your current filters.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-ox-surface border border-ox-edge rounded-xl p-3.5 sm:p-4 hover:border-ox-accent transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-ox-ink leading-relaxed break-words">
                      {q.question}
                    </p>
                    {q.details && (
                      <p className="text-[11px] sm:text-xs text-ox-muted leading-relaxed break-words">
                        {q.details}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-ox-edge/40">
                    <Link
                      href={`/experiences/${q.experienceId}`}
                      className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-ox-accent hover:underline min-h-[30px]"
                    >
                      <span>{q.company}</span>
                      <span className="text-ox-muted">({q.roundName.split("-")[0].trim()})</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center gap-1 flex-wrap">
                      {q.topic && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-accent/10 text-ox-accent border border-ox-accent/20 font-medium">
                          {q.topic}
                        </span>
                      )}
                      {q.difficulty && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-signal-warn/10 text-ox-signal-warn capitalize font-medium">
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Coding problems grid */}
      {activeTab === "coding" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredProblems.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-ox-surface/50 border border-ox-edge rounded-xl text-ox-muted text-sm p-6">
              No coding problems match your current filters.
            </div>
          ) : (
            filteredProblems.map((p, idx) => (
              <div
                key={idx}
                className="bg-ox-surface border border-ox-edge rounded-xl p-3.5 sm:p-4 hover:border-ox-signal-pass/50 transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-ox-signal-pass/10 text-ox-signal-pass font-bold text-xs flex items-center justify-center font-mono shrink-0">
                        P{idx + 1}
                      </span>
                      <h3 className="font-semibold text-xs sm:text-sm text-ox-ink truncate">{p.title}</h3>
                    </div>
                    {p.difficulty && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-signal-warn/10 text-ox-signal-warn capitalize font-medium shrink-0">
                        {p.difficulty}
                      </span>
                    )}
                  </div>

                  {p.description && (
                    <p className="text-[11px] sm:text-xs text-ox-muted leading-relaxed bg-ox-void p-2.5 rounded-lg border border-ox-edge line-clamp-4 break-words">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-ox-edge/60 flex items-center justify-between text-[11px]">
                  <span className="text-ox-muted font-medium truncate max-w-[150px]">{p.company}</span>
                  <Link
                    href={`/experiences/${p.experienceId}`}
                    className="text-ox-accent hover:underline flex items-center gap-1 font-semibold min-h-[30px]"
                  >
                    <span>View Round</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
