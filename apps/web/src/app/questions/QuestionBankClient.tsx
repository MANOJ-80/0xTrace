"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { InterviewQuestion, CodingProblem } from "@/lib/types";
import { Search, Code2, ArrowRight, X } from "lucide-react";

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
    <div className="space-y-5">
      {/* Tab switcher — text tabs with bottom border */}
      <div className="flex items-center gap-0 border-b border-ox-edge">
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "questions"
              ? "border-ox-accent text-ox-ink"
              : "border-transparent text-ox-muted hover:text-ox-ink"
          }`}
        >
          <span>Interview questions ({questions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("coding")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "coding"
              ? "border-ox-accent text-ox-ink"
              : "border-transparent text-ox-muted hover:text-ox-ink"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Coding problems ({codingProblems.length})</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-ox-surface border border-ox-edge rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ox-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === "questions"
                  ? "Search questions by topic, keyword, or company..."
                  : "Search coding problems by title, topic, or company..."
              }
              className="w-full pl-9 pr-8 py-2 rounded-md border border-ox-edge bg-ox-void text-sm text-ox-ink placeholder:text-ox-muted focus:outline-none focus:ring-2 focus:ring-ox-accent/30 focus:border-ox-accent transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ox-muted hover:text-ox-ink"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full md:w-52 shrink-0 py-2 px-3 rounded-md border border-ox-edge bg-ox-void text-sm text-ox-ink font-medium focus:outline-none focus:ring-2 focus:ring-ox-accent/30"
          >
            <option value="">All companies ({companies.length})</option>
            {companies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ox-edge text-xs">
          <div className="flex items-center gap-2">
            <span className="text-ox-muted font-medium">Difficulty:</span>
            {["all", "easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                  selectedDifficulty === diff
                    ? "text-ox-ink font-semibold border-b-2 border-ox-accent"
                    : "text-ox-muted hover:text-ox-ink"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <span className="text-ox-muted">
            Showing{" "}
            <strong className="text-ox-ink font-mono tabular-nums">
              {activeTab === "questions" ? filteredQuestions.length : filteredProblems.length}
            </strong>{" "}
            results
          </span>
        </div>
      </div>

      {/* Questions list */}
      {activeTab === "questions" && (
        <div className="space-y-2">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-ox-muted text-sm">
              No questions match your filters.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-ox-surface border border-ox-edge rounded-lg p-4 hover:border-ox-accent transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-ox-ink leading-relaxed">
                      {q.question}
                    </p>
                    {q.details && (
                      <p className="text-xs text-ox-muted leading-relaxed">{q.details}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap md:flex-col items-start md:items-end gap-1.5 shrink-0">
                    <Link
                      href={`/experiences/${q.experienceId}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-ox-accent hover:underline"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredProblems.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-ox-muted text-sm">
              No coding problems match your filters.
            </div>
          ) : (
            filteredProblems.map((p, idx) => (
              <div
                key={idx}
                className="bg-ox-surface border border-ox-edge rounded-lg p-4 hover:border-ox-signal-pass/50 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-ox-signal-pass/10 text-ox-signal-pass font-bold text-xs flex items-center justify-center font-mono">
                        P{idx + 1}
                      </span>
                      <h3 className="font-semibold text-sm text-ox-ink">{p.title}</h3>
                    </div>
                    {p.difficulty && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-signal-warn/10 text-ox-signal-warn capitalize font-medium shrink-0">
                        {p.difficulty}
                      </span>
                    )}
                  </div>

                  {p.description && (
                    <p className="text-xs text-ox-muted whitespace-pre-line leading-relaxed bg-ox-void p-2.5 rounded-md border border-ox-edge line-clamp-4">
                      {p.description}
                    </p>
                  )}

                  {p.topics && p.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.topics.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-surface-raised text-ox-muted border border-ox-edge">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-ox-edge flex items-center justify-between text-xs">
                  <span className="font-medium text-ox-ink">{p.company}</span>
                  <Link
                    href={`/experiences/${p.experienceId}`}
                    className="flex items-center gap-1 font-medium text-ox-signal-pass hover:underline"
                  >
                    <span>View experience</span>
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
