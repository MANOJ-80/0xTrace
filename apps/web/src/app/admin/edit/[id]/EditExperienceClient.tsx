"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from "lucide-react";

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

  if (loading) {
    return <div className="p-8 text-center text-ox-muted">Loading experience record...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ox-edge pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-ox-muted hover:text-ox-ink transition-colors min-h-[38px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin</span>
          </Link>
          <span className="text-ox-edge">|</span>
          <span className="text-xs font-mono text-ox-ink">Editing: {id}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-ox-ink bg-ox-accent border-2 border-ox-ink rounded-lg shadow-neo active:shadow-none transition-all disabled:opacity-50 min-h-[40px]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/20 border border-red-900/50 text-red-400 rounded-xl text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-green-950/20 border border-green-900/50 text-green-400 rounded-xl text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Experience updated successfully in MongoDB!</span>
        </div>
      )}

      {/* Code Editor Container */}
      <div className="bg-ox-surface border border-ox-edge rounded-xl p-3 sm:p-4 space-y-2 shadow-sm">
        <label className="block text-xs font-mono text-ox-muted">
          Structured Experience Schema (JSON)
        </label>
        <textarea
          value={jsonStr}
          onChange={(e) => setJsonStr(e.target.value)}
          rows={24}
          className="w-full bg-ox-void border border-ox-edge rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm text-ox-ink leading-relaxed focus:outline-none focus:border-ox-accent resize-y"
        />
      </div>
    </div>
  );
}
