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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="admin-edit-page space-y-6">
      <header className="page-heading">
        <div>
          <Link href="/admin" className="back-link mb-3 inline-flex items-center gap-2">
            <span aria-hidden="true">←</span> Back to experience manager
          </Link>
          <div className="page-kicker">Record editor</div>
          <h1 className="page-title">Raw JSON source</h1>
          <p className="page-description">
            Edit the stored document directly. <Link href={`/admin/edit/${id}`} className="underline">Return to the structured editor</Link> for normal changes.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="ui-action-primary disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </header>

      {error && (
        <div className="feedback-error" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="feedback-success" role="status">
          Experience saved.
        </div>
      )}

      <div className="json-editor-wrap overflow-hidden">
        <textarea
          aria-label="Experience JSON source"
          value={jsonStr}
          onChange={(e) => setJsonStr(e.target.value)}
          className="w-full h-[600px] p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm leading-relaxed focus:outline-none resize-y"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
