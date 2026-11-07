"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Experience } from "@/lib/types";

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
    return <div className="p-8 text-ox-ink">Loading...</div>;
  }

  return (
    <div className="admin-page space-y-6">
      <header className="page-heading">
        <div>
          <div className="page-kicker">Administration</div>
          <h1 className="page-title">Experience manager</h1>
          <p className="page-description">Review and maintain candidate-submitted interview records.</p>
        </div>
        <div className="admin-page-actions">
          <Link
            href="/contribute"
            className="ui-action-primary"
          >
            Add experience
          </Link>
        </div>
      </header>

      <div className="admin-count"><span>{experiences.length}</span> experiences in the library</div>

      {error && <div className="feedback-error" role="alert">{error}</div>}

      <div className="admin-search-row">
        <input 
          type="text" 
          placeholder="Search by company or candidate..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search experiences by company or candidate"
          className="flex-1 px-4 py-2.5 border border-ox-edge rounded-lg bg-ox-surface text-ox-ink outline-none focus:ring-2 focus:ring-ox-accent/25 focus:border-ox-accent"
        />
      </div>
      <div className="admin-table-wrap overflow-x-auto">
        <table className="admin-table w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-ox-edge bg-ox-window text-ox-ink">
              <th className="p-4 font-semibold">Company</th>
              <th className="p-4 font-semibold">Candidate</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Outcome</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.filter(e => {
              const q = search.toLowerCase();
              return (e.company?.name || '').toLowerCase().includes(q) || (e.candidate?.name || '').toLowerCase().includes(q);
            }).map((exp, i) => {
              const rowId = exp._id || exp.id;
              return (
                <tr key={rowId} className={`border-b border-ox-edge/30 ${i % 2 === 0 ? "bg-ox-surface" : "bg-ox-window/50"} hover:bg-ox-accent/10 transition-colors`}>
                  <td className="p-4 font-medium text-ox-ink">{exp.company?.name || "Unknown"}</td>
                  <td className="p-4 text-ox-text">{exp.candidate?.name || "Anonymous"}</td>
                  <td className="p-4 text-ox-text">{exp.job?.role || "Not specified"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border border-ox-edge ${
                      exp.outcome?.status?.toLowerCase() === "selected" ? "bg-ox-signal-pass/10 text-emerald-300 border-ox-signal-pass/30" :
                      exp.outcome?.status?.toLowerCase() === "rejected" ? "bg-ox-signal-fail/10 text-red-300 border-ox-signal-fail/30" :
                      "bg-ox-signal-warn/10 text-amber-200 border-ox-signal-warn/30"
                    }`}>
                      {exp.outcome?.status || "Unknown"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <Link
                      href={`/admin/edit/${rowId}`}
                      className="text-ox-accent font-semibold hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(rowId)}
                      className="text-red-500 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                    <Link href={"/experiences/" + rowId} target="_blank" className="text-ox-text font-semibold hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {experiences.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-ox-text">No experiences found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
