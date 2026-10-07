"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Experience } from "@/lib/types";
import ExperienceCard from "@/components/ExperienceCard";
import { Search } from "lucide-react";

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
  }, [initialExperiences, search, selectedCompany, selectedOutcome, sortBy]);

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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ox-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, role, candidate..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-ox-edge bg-ox-surface text-sm text-ox-ink placeholder:text-ox-muted focus:outline-none focus:border-ox-accent"
            />
          </div>

          {/* Company Dropdown */}
          <div className="w-full md:w-56 shrink-0">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full py-2 px-3 rounded-md border border-ox-edge bg-ox-surface text-sm text-ox-ink focus:outline-none focus:border-ox-accent appearance-none"
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
            <div className="w-full md:w-48 shrink-0">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full py-2 px-3 rounded-md border border-ox-edge bg-ox-surface text-sm text-ox-ink focus:outline-none focus:border-ox-accent appearance-none"
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
          <div className="w-full md:w-44 shrink-0 flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 rounded-md border border-ox-edge bg-ox-surface text-sm text-ox-ink focus:outline-none focus:border-ox-accent appearance-none"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="rounds">Sort: Most Rounds</option>
              <option value="company">Sort: Company (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filters and Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm border-b border-ox-edge">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedOutcome("all")}
              className={`pb-2 -mb-[1px] transition-colors ${
                selectedOutcome === "all"
                  ? "text-ox-ink font-semibold border-b-2 border-ox-accent"
                  : "text-ox-muted hover:text-ox-ink"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedOutcome("selected")}
              className={`pb-2 -mb-[1px] transition-colors ${
                selectedOutcome === "selected"
                  ? "text-ox-ink font-semibold border-b-2 border-ox-accent"
                  : "text-ox-muted hover:text-ox-ink"
              }`}
            >
              Selected
            </button>
            <button
              onClick={() => setSelectedOutcome("rejected")}
              className={`pb-2 -mb-[1px] transition-colors ${
                selectedOutcome === "rejected"
                  ? "text-ox-ink font-semibold border-b-2 border-ox-accent"
                  : "text-ox-muted hover:text-ox-ink"
              }`}
            >
              Rejected
            </button>
          </div>

          <div className="flex items-center gap-3 pb-2">
            <span className="text-ox-muted">
              Showing {filteredAndSorted.length} of {initialExperiences.length}
            </span>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-ox-accent hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {filteredAndSorted.length === 0 ? (
        <div className="flex items-center gap-2 py-8 text-sm">
          <Search className="w-6 h-6 text-ox-muted" />
          <span className="text-ox-muted">No interview experiences match your search.</span>
          <button
            onClick={resetFilters}
            className="text-ox-accent hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSorted.map((exp) => (
            <ExperienceCard key={exp._id || exp.id} experience={exp} />
          ))}
        </div>
      )}
    </div>
  );
}
