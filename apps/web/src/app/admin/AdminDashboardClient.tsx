"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Experience } from "@/lib/types";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authKey, setAuthKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("ox_admin_key");
    if (savedKey) {
      setAuthKey(savedKey);
      setIsAuthenticated(true);
      fetchExperiences();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchExperiences = async () => {
    try {
      // Just fetch page 1 for now, or maybe a dedicated admin route.
      // We can use the existing /api/experiences but it paginates. 
      // Let's fetch with a high limit.
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ox_admin_key", authKey);
    setIsAuthenticated(true);
    setLoading(true);
    fetchExperiences();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this experience? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/experiences/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-key": authKey,
        },
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

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-ox-surface border-4 border-ox-edge rounded-xl shadow-neo">
        <h1 className="text-2xl font-bold mb-6 text-ox-ink">Admin Access</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ox-ink mb-1">Admin Key</label>
            <input
              type="password"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              className="w-full px-4 py-2 border-2 border-ox-edge rounded bg-ox-window focus:border-ox-accent outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-ox-accent border-2 border-ox-ink font-semibold rounded shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-ox-ink"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ox-ink">Admin Dashboard</h1>
          <p className="text-ox-muted mt-2 text-sm">Secure management console for auditing, editing, and deleting candidate experiences.</p>
          <p className="text-ox-text mt-2">Manage {experiences.length} experiences</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              localStorage.removeItem("ox_admin_key");
              setIsAuthenticated(false);
              setAuthKey("");
            }}
            className="px-4 py-2 border-2 border-ox-edge bg-ox-window font-semibold rounded hover:bg-red-100 transition-colors text-ox-ink"
          >
            Logout
          </button>
          <Link
            href="/contribute"
            className="px-4 py-2 bg-ox-accent border-2 border-ox-ink font-semibold rounded shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-ox-ink"
          >
            + Add New
          </Link>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      <div className="mb-6 flex gap-4">
        <input 
          type="text" 
          placeholder="Search by company or candidate..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border-2 border-ox-edge rounded-lg bg-ox-surface text-ox-ink outline-none focus:border-ox-accent"
        />
      </div>
      <div className="bg-ox-surface border-2 border-ox-edge rounded-lg overflow-x-auto shadow-neo">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-ox-edge bg-ox-window text-ox-ink">
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
                      exp.outcome?.status?.toLowerCase() === "selected" ? "bg-green-100 text-green-800" :
                      exp.outcome?.status?.toLowerCase() === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
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
