"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Experience } from "@/lib/types";
import ExperienceCard from "@/components/ExperienceCard";
import { Search, X, SlidersHorizontal, RotateCcw } from "lucide-react";

interface ExperienceDirectoryClientProps {
  initialExperiences: Experience[];
  companies: string[];
  roles?: string[];
}

export default function ExperienceDirectoryClient({
  initialExperiences,
  companies,
  roles = [],
}: ExperienceDirectoryClientProps) {
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get("company") || "";
  const initialSort = searchParams.get("sortBy") || "recent";

  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(initialCompany);
  const [selectedRole, setSelectedRole] = useState("all");
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

      // Role filter
      if (selectedRole !== "all") {
        const rName = exp.job?.role || "";
        if (rName !== selectedRole) return false;
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
  }, [initialExperiences, search, selectedCompany, selectedRole, selectedOutcome, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCompany("");
    setSelectedRole("all");
    setSelectedOutcome("all");
    setSortBy("recent");
  };

  const isFiltered =
    search !== "" ||
    (selectedCompany !== "" && selectedCompany !== "all") ||
    selectedRole !== "all" ||
    selectedOutcome !== "all" ||
    sortBy !== "recent";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-ox-surface border border-ox-edge rounded-xl p-3.5 sm:p-4 space-y-3 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-ox-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, candidate, topic..."
            className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-ox-edge bg-ox-void text-sm text-ox-ink placeholder:text-ox-muted focus:outline-none focus:ring-2 focus:ring-ox-accent/30 focus:border-ox-accent min-h-[42px] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ox-muted hover:text-ox-ink rounded"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {/* Company Dropdown */}
          <div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-ox-edge bg-ox-void text-xs sm:text-sm text-ox-ink focus:outline-none focus:ring-2 focus:ring-ox-accent/30 focus:border-ox-accent appearance-none min-h-[42px] font-medium"
            >
              <option value="">All Companies ({companies.length})</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Role Dropdown */}
          {roles.length > 0 && (
            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-ox-edge bg-ox-void text-xs sm:text-sm text-ox-ink focus:outline-none focus:ring-2 focus:ring-ox-accent/30 focus:border-ox-accent appearance-none min-h-[42px] font-medium"
              >
                <option value="all">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-ox-edge bg-ox-void text-xs sm:text-sm text-ox-ink focus:outline-none focus:ring-2 focus:ring-ox-accent/30 focus:border-ox-accent appearance-none min-h-[42px] font-medium"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="rounds">Sort: Most Rounds</option>
              <option value="company">Sort: Company (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Outcome Filter Chips & Result Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ox-edge/60 text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: "all", label: "All" },
              { id: "selected", label: "Selected" },
              { id: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedOutcome(tab.id)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all min-h-[34px] ${
                  selectedOutcome === tab.id
                    ? "bg-ox-accent text-white"
                    : "text-ox-muted hover:text-ox-ink hover:bg-ox-surface-raised"
                }`}
              >
                {tab.label}
              </button>
            ))}

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[11px] text-ox-muted hover:text-ox-accent ml-2 py-1 px-2 rounded hover:bg-ox-surface-raised transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <span className="text-ox-muted font-mono text-[11px] sm:text-xs">
            Showing <strong className="text-ox-ink">{filteredAndSorted.length}</strong> of {initialExperiences.length}
          </span>
        </div>
      </div>

      {/* Directory Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-16 bg-ox-surface/50 border border-ox-edge rounded-xl p-8 space-y-3">
          <p className="text-sm text-ox-muted">
            No interview experiences found matching your current filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-semibold text-ox-accent bg-ox-accent/10 border border-ox-accent/30 rounded-lg hover:bg-ox-accent/20 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredAndSorted.map((exp) => (
            <ExperienceCard key={exp._id || exp.id} experience={exp} />
          ))}
        </div>
      )}
    </div>
  );
}
