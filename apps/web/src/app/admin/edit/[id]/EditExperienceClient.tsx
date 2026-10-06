"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditExperienceClient({ id }: { id: string }) {
  const router = useRouter();
  const [jsonStr, setJsonStr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const res = await fetch(`/api/experiences/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch experience");
        }
        const data = await res.json();
        setJsonStr(JSON.stringify(data, null, 2));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExperience();
  }, [id]);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);

    const authKey = localStorage.getItem("ox_admin_key");
    if (!authKey) {
      setError("Not authenticated. Please return to the dashboard and login.");
      setSaving(false);
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/experiences/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": authKey,
        },
        body: JSON.stringify(parsedData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-ox-text hover:text-ox-ink mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-ox-ink">Edit Experience</h1>
          <p className="text-ox-text mt-1 text-sm">Directly edit the JSON representation of this experience.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-ox-accent border-2 border-ox-ink font-semibold rounded shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-ox-ink disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded text-red-800 font-medium">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 border-2 border-green-500 rounded text-green-800 font-medium">
          Successfully saved!
        </div>
      )}

      <div className="bg-ox-surface border-2 border-ox-edge rounded-lg shadow-neo overflow-hidden">
        <textarea
          value={jsonStr}
          onChange={(e) => setJsonStr(e.target.value)}
          className="w-full h-[600px] p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm leading-relaxed focus:outline-none resize-y"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
