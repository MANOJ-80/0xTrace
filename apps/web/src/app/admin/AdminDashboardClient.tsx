"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Experience } from "@/lib/types";
import { Search, Plus, ExternalLink, Edit, Trash2 } from "lucide-react";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await fetch("/api/experiences?limit=1000");
      const data = await res.json();
      if (res.ok) {
        setExperiences(data.experiences);
      } else {
        setError("Failed to fetch experiences");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this experience? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/experiences/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExperiences(experiences.filter((e) => (e._id || e.id) !== id));
      } else {
        const data = await res.json();
        alert(`Delete failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-ox-ink text-center">Loading management console...</div>;
  }

  const filtered = experiences.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.company?.name || "").toLowerCase().includes(q) ||
      (e.candidate?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ox-edge pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ox-ink tracking-tight font-geist">
            Admin Console
          </h1>
          <p className="text-ox-muted mt-1 text-xs sm:text-sm">
            Auditing, editing, and management console for {experiences.length} canonical placement records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contribute"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ox-accent border-2 border-ox-ink font-semibold rounded-lg shadow-neo active:shadow-none transition-all text-xs sm:text-sm text-ox-ink min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-ox-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Filter by company or candidate name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-ox-edge rounded-lg bg-ox-surface text-sm text-ox-ink outline-none focus:border-ox-accent min-h-[42px]"
        />
      </div>

      {/* Responsive Table Card */}
      <div className="bg-ox-surface border border-ox-edge rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-ox-edge bg-ox-void text-ox-muted">
              <th className="p-3 sm:p-4 font-semibold">Company</th>
              <th className="p-3 sm:p-4 font-semibold">Candidate</th>
              <th className="p-3 sm:p-4 font-semibold hidden md:table-cell">Role</th>
              <th className="p-3 sm:p-4 font-semibold">Outcome</th>
              <th className="p-3 sm:p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((exp, i) => {
              const rowId = exp._id || exp.id;
              const outcome = exp.outcome?.status?.toLowerCase() || "";
              const isSelected = outcome.includes("select") || outcome.includes("offer");
              const isRejected = outcome.includes("reject");

              return (
                <tr 
                  key={rowId} 
                  className={`border-b border-ox-edge/40 ${
                    i % 2 === 0 ? "bg-ox-surface" : "bg-ox-void/40"
                  } hover:bg-ox-accent/5 transition-colors`}
                >
                  <td className="p-3 sm:p-4 font-bold text-ox-ink whitespace-nowrap">
                    {exp.company?.name || "Unknown"}
                  </td>
                  <td className="p-3 sm:p-4 text-ox-ink whitespace-nowrap">
                    {exp.candidate?.name || "Anonymous"}
                  </td>
                  <td className="p-3 sm:p-4 text-ox-muted hidden md:table-cell whitespace-nowrap">
                    {exp.job?.role || "Software Engineer"}
                  </td>
                  <td className="p-3 sm:p-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full border ${
                      isSelected ? "bg-green-950/30 text-green-400 border-green-800" :
                      isRejected ? "bg-red-950/30 text-red-400 border-red-800" :
                      "bg-ox-surface-raised text-ox-muted border-ox-edge"
                    }`}>
                      {exp.outcome?.status || "Unknown"}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/edit/${rowId}`}
                        className="text-ox-accent hover:underline font-semibold flex items-center gap-1 min-h-[36px] py-1 px-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(rowId)}
                        className="text-red-400 hover:text-red-300 hover:underline font-semibold flex items-center gap-1 min-h-[36px] py-1 px-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                      <Link 
                        href={`/experiences/${rowId}`} 
                        target="_blank" 
                        className="text-ox-muted hover:text-ox-ink flex items-center gap-1 min-h-[36px] py-1 px-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-ox-muted">
                  No matching experiences found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
