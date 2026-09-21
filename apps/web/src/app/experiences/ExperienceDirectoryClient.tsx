"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Experience } from "@/lib/types";
import ExperienceCard from "@/components/ExperienceCard";
import { Search, X, Filter, RotateCcw, ArrowUpDown } from "lucide-react";

interface ExperienceDirectoryClientProps {
  initialExperiences: Experience[];
  companies: string[];
}

export default function ExperienceDirectoryClient({
  initialExperiences,
  companies,
}: ExperienceDirectoryClientProps) {
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get("company") || "";
  const initialSort = searchParams.get("sortBy") || "recent";

  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(initialCompany);
  const [selectedOutcome, setSelectedOutcome] = useState("all");
  const [sortBy, setSortBy] = useState(initialSort);

  useEffect(() => {
    if (initialCompany) {
      setSelectedCompany(initialCompany);
    }
  }, [initialCompany]);

  const filteredAndSorted = useMemo(() => {
    let list = initialExperiences.filter((exp) => {
      // Search term
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const cName = (exp.company?.name || "").toLowerCase();
        const rName = (exp.job?.role || "").toLowerCase();
        const dept = (exp.candidate?.department || "").toLowerCase();
        const candName = (exp.candidate?.name || "").toLowerCase();
        const raw = (exp.raw_text || "").toLowerCase();

        const matches =
          cName.includes(q) ||
          rName.includes(q) ||
          dept.includes(q) ||
          candName.includes(q) ||
          raw.includes(q);

        if (!matches) return false;
      }

      // Company filter
      if (selectedCompany && selectedCompany !== "all") {
        const cName = exp.company?.name || exp.company?.normalized_name || "";
        if (cName.toLowerCase() !== selectedCompany.toLowerCase()) {
          return false;
        }
      }

      // Outcome filter
      if (selectedOutcome !== "all") {
        const status = (exp.outcome?.status || "").toLowerCase();
        if (selectedOutcome === "selected") {
          if (!status.includes("select") && !status.includes("offer")) return false;
        } else if (selectedOutcome === "rejected") {
          if (!status.includes("reject")) return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === "rounds") {
      list.sort((a, b) => (b.rounds?.length || 0) - (a.rounds?.length || 0));
    } else if (sortBy === "company") {
      list.sort((a, b) =>
        (a.company?.name || "").localeCompare(b.company?.name || "")
      );
    } else {
      // Default: recent (by experience number descending)
      list.sort((a, b) => {
        const numA = parseInt(a.id.replace("exp_", ""), 10) || 0;
        const numB = parseInt(b.id.replace("exp_", ""), 10) || 0;
        return numB - numA;
      });
    }

    return list;
  }, [initialExperiences, search, selectedCompany, selectedOutcome, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCompany("");
    setSelectedOutcome("all");
    setSortBy("recent");
  };

  const isFiltered =
    search !== "" ||
    (selectedCompany !== "" && selectedCompany !== "all") ||
    selectedOutcome !== "all" ||
    sortBy !== "recent";

  return (
    <div className="space-y-6">
      {/* Filter Controls Bar */}
      <div className="bg-[#11141c] border border-[#1e2433] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, role, candidate, or keywords (e.g. 'Societe Generale', 'Walmart', 'DSA')..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#232938] bg-[#0c0e14] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Company Dropdown */}
          <div className="w-full md:w-56 shrink-0">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-[#232938] bg-[#0c0e14] text-sm text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">All Companies ({companies.length})</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full md:w-44 shrink-0 flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-[#232938] bg-[#0c0e14] text-sm text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="rounds">Sort: Most Rounds</option>
              <option value="company">Sort: Company (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1a1f2c] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Outcome:
            </span>
            <button
              onClick={() => setSelectedOutcome("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedOutcome === "all"
                  ? "bg-white text-slate-950 font-bold"
                  : "bg-[#181d28] text-slate-400 hover:text-slate-200 border border-[#232938]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedOutcome("selected")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedOutcome === "selected"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/40"
              }`}
            >
              Selected / Offered
            </button>
            <button
              onClick={() => setSelectedOutcome("rejected")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedOutcome === "rejected"
                  ? "bg-rose-600 text-white font-bold"
                  : "bg-rose-950/40 text-rose-400 border border-rose-800/60 hover:bg-rose-900/40"
              }`}
            >
              Rejected
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">
              Showing <strong className="text-white">{filteredAndSorted.length}</strong> of{" "}
              {initialExperiences.length}
            </span>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-indigo-400 hover:underline font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {filteredAndSorted.length === 0 ? (
        <div className="bg-[#11141c] border border-[#1e2433] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#181d28] text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            No interview experiences match your search
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or clearing active filters to see all 126 experiences.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSorted.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      )}
    </div>
  );
}
