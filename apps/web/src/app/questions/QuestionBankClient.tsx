"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { InterviewQuestion, CodingProblem } from "@/lib/types";
import {
  Search,
  HelpCircle,
  Code2,
  Building2,
  Tag,
  ArrowRight,
  Flame,
  X,
  Filter,
} from "lucide-react";

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
        if (
          !text.includes(query) &&
          !topic.includes(query) &&
          !category.includes(query) &&
          !comp.includes(query)
        ) {
          return false;
        }
      }

      if (selectedCompany && selectedCompany !== "all") {
        if (q.company.toLowerCase() !== selectedCompany.toLowerCase()) return false;
      }

      if (selectedDifficulty !== "all") {
        if ((q.difficulty || "").toLowerCase() !== selectedDifficulty.toLowerCase()) {
          return false;
        }
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
        if (
          !title.includes(query) &&
          !desc.includes(query) &&
          !comp.includes(query) &&
          !topics.includes(query)
        ) {
          return false;
        }
      }

      if (selectedCompany && selectedCompany !== "all") {
        if (p.company.toLowerCase() !== selectedCompany.toLowerCase()) return false;
      }

      if (selectedDifficulty !== "all") {
        if ((p.difficulty || "").toLowerCase() !== selectedDifficulty.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [codingProblems, search, selectedCompany, selectedDifficulty]);

  return (
    <div className="space-y-6">
      {/* Top Tab Switcher */}
      <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "questions"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Interview Questions ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("coding")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "coding"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Coding Problems ({codingProblems.length})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === "questions"
                  ? "Search questions (e.g. 'deadlock', 'indexing', 'polymorphism', 'LRU cache')..."
                  : "Search coding problems (e.g. 'two sum', 'binary tree', 'graph', 'dynamic programming')..."
              }
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="w-full md:w-56 shrink-0">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Companies ({companies.length})</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium mr-1">Difficulty:</span>
            {["all", "easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                  selectedDifficulty === diff
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <span className="text-slate-500 font-medium">
            Showing{" "}
            <strong className="text-slate-900 dark:text-slate-100">
              {activeTab === "questions" ? filteredQuestions.length : filteredProblems.length}
            </strong>{" "}
            entries
          </span>
        </div>
      </div>

      {/* Questions Tab Content */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
              No questions found matching your filter criteria.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {q.question}
                    </p>
                    {q.details && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {q.details}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
                    <Link
                      href={`/experiences/${q.experienceId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{q.company}</span>
                      <span className="text-slate-400">({q.roundName.split("-")[0].trim()})</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {q.topic && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
                          {q.topic}
                        </span>
                      )}
                      {q.difficulty && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 capitalize">
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

      {/* Coding Problems Tab Content */}
      {activeTab === "coding" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProblems.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
              No coding problems found matching your filter criteria.
            </div>
          ) : (
            filteredProblems.map((p, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                        P{idx + 1}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {p.title}
                      </h3>
                    </div>

                    {p.difficulty && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 capitalize shrink-0">
                        {p.difficulty}
                      </span>
                    )}
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-4">
                      {p.description}
                    </p>
                  )}

                  {p.topics && p.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.topics.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {p.company}
                  </span>

                  <Link
                    href={`/experiences/${p.experienceId}`}
                    className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>View Experience</span>
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
