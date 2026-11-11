"use client";

import { useMemo, useState } from "react";
import { ExtractionResponse, Experience, Round } from "@/lib/types";
import RoundViewer from "@/components/RoundViewer";
import LosslessViewer from "@/components/LosslessViewer";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Code,
  Layers,
  ArrowRight,
  ShieldCheck,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

interface ExtractionStudioProps {
  initialSample?: ExtractionResponse | null;
}

const OUTCOME_OPTIONS = ["selected", "rejected", "unknown"] as const;

export default function ExtractionStudio({ initialSample }: ExtractionStudioProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResponse | null>(initialSample || null);
  const [activeTab, setActiveTab] = useState<"structured" | "lossless" | "json">("structured");
  const [isEditing, setIsEditing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(false);
  const [ingestResult, setIngestResult] = useState<{
    assigned_id: string;
    total_experiences: number;
    duplicate?: boolean;
    message?: string;
  } | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const experience = result?.experiences?.[0];
  const pipeline = result?.pipeline;

  const readiness = useMemo(() => {
    if (!experience) return { ready: false, missing: ["No extraction result"] };
    const missing: string[] = [];
    if (!experience.company?.name?.trim()) missing.push("company name");
    if (!experience.rounds?.length) missing.push("at least one round");
    return { ready: missing.length === 0, missing };
  }, [experience]);

  const resetIngestState = () => {
    setIngestSuccess(false);
    setIngestResult(null);
    setIngestError(null);
  };

  const patchExperience = (patch: Partial<Experience>) => {
    setResult((previous) => {
      if (!previous?.experiences?.[0]) return previous;
      const experiences = [...previous.experiences];
      experiences[0] = { ...experiences[0], ...patch };
      return { ...previous, experiences };
    });
    resetIngestState();
  };

  const patchRound = (index: number, patch: Partial<Round>) => {
    setResult((previous) => {
      if (!previous?.experiences?.[0]) return previous;
      const experiences = [...previous.experiences];
      const rounds = [...experiences[0].rounds];
      if (!rounds[index]) return previous;
      rounds[index] = { ...rounds[index], ...patch };
      experiences[0] = { ...experiences[0], rounds };
      return { ...previous, experiences };
    });
    resetIngestState();
  };

  const removeRound = (index: number) => {
    setResult((previous) => {
      if (!previous?.experiences?.[0]) return previous;
      const experiences = [...previous.experiences];
      const rounds = experiences[0].rounds.filter((_, i) => i !== index);
      experiences[0] = { ...experiences[0], rounds };
      return { ...previous, experiences };
    });
    resetIngestState();
  };

  const addBlankRound = () => {
    setResult((previous) => {
      if (!previous?.experiences?.[0]) return previous;
      const experiences = [...previous.experiences];
      const rounds = [
        ...experiences[0].rounds,
        {
          sequence: experiences[0].rounds.length + 1,
          name: `Round ${experiences[0].rounds.length + 1}`,
          type: "technical_interview",
          raw_content: "",
          questions: [],
          coding: { problems: [] },
        },
      ];
      experiences[0] = { ...experiences[0], rounds };
      return { ...previous, experiences };
    });
    resetIngestState();
  };

  const handleApproveAndIngest = async () => {
    if (!experience) return;

    if (!readiness.ready) {
      setIngestError(`Before publishing, add: ${readiness.missing.join(", ")}.`);
      return;
    }

    setIsIngesting(true);
    setIngestError(null);

    try {
      const res = await fetch("/api/canonical/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experience }),
      });
      const data = await res.json();

      if (!res.ok) {
        const detail = data?.issues
          ? data.issues.map((issue: any) => `${issue.path}: ${issue.message}`).join("; ")
          : null;
        throw new Error(detail || data.error || data.detail || "Ingestion failed.");
      }

      setIngestSuccess(true);
      setIngestResult(data);
    } catch (err: any) {
      setIngestError(err.message || "Failed to publish this experience.");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleFileUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setIngestSuccess(false);
    setIngestResult(null);
    setIngestError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail = data.detail ? ` ${data.detail}` : "";
        throw new Error((data.error || `Server responded with ${res.status}`) + detail);
      }

      setResult(data);
      setIsEditing(true);
      setActiveTab("structured");
    } catch (err: any) {
      setError(err.message || "Could not process this PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="bg-ox-surface border border-ox-edge rounded-lg p-6 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-2 text-center">
          <h2 className="text-xl font-bold text-ox-ink">Upload an interview PDF</h2>
          <p className="text-sm text-ox-muted">
            The PDF is parsed into rounds, questions, and coding problems. Nothing is
            published until you review and confirm it.
          </p>
        </div>

        <form onSubmit={handleFileUpload} className="mt-6 max-w-xl mx-auto space-y-4">
          <div className="border-2 border-dashed border-ox-edge hover:border-ox-accent rounded-lg p-6 text-center cursor-pointer transition-colors bg-ox-void">
            <input
              type="file"
              accept=".pdf,application/pdf"
              id="pdf-upload"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (!selected) return;
                if (selected.size > 4.5 * 1024 * 1024) {
                  setFile(null);
                  setError("PDF file must be under 4.5 MB for upload.");
                  return;
                }
                setFile(selected);
                setError(null);
              }}
            />
            <label htmlFor="pdf-upload" className="cursor-pointer block space-y-2">
              <Upload className="w-6 h-6 text-ox-accent mx-auto" />
              <div className="text-sm font-medium text-ox-ink">
                {file ? file.name : "Select a PDF file"}
              </div>
              <p className="text-xs text-ox-muted">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF up to 4.5 MB"}
              </p>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || isLoading}
            className="ui-action-secondary w-full justify-center gap-2 disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting…</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Extract from PDF</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-5 max-w-xl mx-auto p-3 rounded-lg bg-ox-signal-fail/10 border border-ox-signal-fail/30 text-ox-signal-fail text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Extraction error</p>
              <p className="mt-0.5 leading-relaxed text-ox-ink/70">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && experience && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-ox-surface border border-ox-edge rounded-lg p-4">
            <div>
              <h3 className="font-bold text-ox-ink text-sm flex items-center gap-2">
                {experience.company?.name || "Company missing"}
                <span className="text-xs px-2 py-0.5 rounded-sm font-medium bg-ox-signal-pass/10 text-ox-signal-pass border border-ox-signal-pass/20 capitalize">
                  {experience.outcome?.status || "draft"}
                </span>
              </h3>
              <p className="text-xs text-ox-muted mt-0.5">
                {experience.job?.role || "Role not set"} · {experience.rounds?.length || 0}{" "}
                rounds · {experience.candidate?.name || "Candidate not set"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing((value) => !value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-ox-edge text-ox-ink hover:border-ox-accent transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                {isEditing ? "Hide editor" : "Edit before publishing"}
              </button>

              <button
                type="button"
                onClick={handleApproveAndIngest}
                disabled={isIngesting || ingestSuccess || !readiness.ready}
                title={
                  readiness.ready
                    ? "Publish this experience"
                    : `Missing: ${readiness.missing.join(", ")}`
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  ingestSuccess
                    ? "bg-ox-signal-pass/10 text-ox-signal-pass cursor-default"
                    : "ui-action-primary disabled:opacity-50"
                }`}
              >
                {isIngesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing…</span>
                  </>
                ) : ingestSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm & publish</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Pipeline warnings */}
          {pipeline?.warnings?.length ? (
            <div className="p-3 rounded-lg bg-ox-signal-warn/10 border border-ox-signal-warn/30 text-ox-signal-warn text-xs">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Review these before publishing
              </p>
              <ul className="mt-1.5 space-y-1 list-disc pl-5 text-ox-ink/75">
                {pipeline.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Editor */}
          {isEditing && (
            <div className="bg-ox-surface border border-ox-edge rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-ox-ink text-sm">Review & correct</h4>
                <span className="text-[11px] text-ox-muted">
                  Fields marked * are required to publish
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs">
                  <span className="font-medium text-ox-ink">Company *</span>
                  <input
                    value={experience.company?.name || ""}
                    onChange={(event) =>
                      patchExperience({
                        company: {
                          ...experience.company,
                          name: event.target.value,
                          normalized_name: event.target.value.toLowerCase().trim(),
                        },
                      })
                    }
                    placeholder="e.g. Walmart"
                    className="w-full px-3 py-2 rounded-md bg-ox-void border border-ox-edge text-ox-ink text-sm focus:outline-none focus:border-ox-accent"
                  />
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-medium text-ox-ink">Role</span>
                  <input
                    value={experience.job?.role || ""}
                    onChange={(event) =>
                      patchExperience({ job: { ...experience.job, role: event.target.value } })
                    }
                    placeholder="e.g. Software Engineer"
                    className="w-full px-3 py-2 rounded-md bg-ox-void border border-ox-edge text-ox-ink text-sm focus:outline-none focus:border-ox-accent"
                  />
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-medium text-ox-ink">Candidate name</span>
                  <input
                    value={experience.candidate?.name || ""}
                    onChange={(event) =>
                      patchExperience({
                        candidate: { ...experience.candidate, name: event.target.value },
                      })
                    }
                    placeholder="e.g. Candidate C"
                    className="w-full px-3 py-2 rounded-md bg-ox-void border border-ox-edge text-ox-ink text-sm focus:outline-none focus:border-ox-accent"
                  />
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-medium text-ox-ink">Outcome</span>
                  <select
                    value={experience.outcome?.status || "unknown"}
                    onChange={(event) =>
                      patchExperience({
                        outcome: { ...experience.outcome, status: event.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-md bg-ox-void border border-ox-edge text-ox-ink text-sm focus:outline-none focus:border-ox-accent"
                  >
                    {OUTCOME_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ox-ink">
                    Rounds ({experience.rounds?.length || 0}) *
                  </span>
                  <button
                    type="button"
                    onClick={addBlankRound}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border border-ox-edge text-ox-muted hover:text-ox-ink"
                  >
                    <Plus className="w-3 h-3" />
                    Add round
                  </button>
                </div>

                {experience.rounds?.length ? (
                  <div className="space-y-2">
                    {experience.rounds.map((round, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row gap-2 p-2.5 rounded-md bg-ox-void border border-ox-edge"
                      >
                        <span className="text-[11px] font-mono text-ox-muted sm:w-6 sm:pt-2">
                          {index + 1}
                        </span>
                        <input
                          value={round.name}
                          onChange={(event) => patchRound(index, { name: event.target.value })}
                          className="flex-1 px-2.5 py-1.5 rounded-sm bg-ox-surface border border-ox-edge text-ox-ink text-xs focus:outline-none focus:border-ox-accent"
                        />
                        <input
                          value={round.type}
                          onChange={(event) => patchRound(index, { type: event.target.value })}
                          className="sm:w-48 px-2.5 py-1.5 rounded-sm bg-ox-surface border border-ox-edge text-ox-ink text-xs focus:outline-none focus:border-ox-accent"
                        />
                        <button
                          type="button"
                          onClick={() => removeRound(index)}
                          disabled={experience.rounds.length <= 1}
                          className="self-start sm:self-center p-1.5 rounded-sm text-ox-signal-fail hover:bg-ox-signal-fail/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Remove this round"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-md bg-ox-signal-fail/10 border border-ox-signal-fail/30 text-ox-signal-fail text-xs">
                    No rounds left. Add at least one before publishing.
                  </div>
                )}
              </div>

              {!readiness.ready && (
                <p className="text-xs text-ox-signal-warn">
                  Missing before publish: {readiness.missing.join(", ")}.
                </p>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-ox-edge">
            {([
              { key: "structured" as const, label: "Structured view", icon: Layers },
              { key: "lossless" as const, label: "Lossless source", icon: ShieldCheck },
              { key: "json" as const, label: "Raw JSON", icon: Code },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-ox-accent text-ox-ink"
                    : "border-transparent text-ox-muted hover:text-ox-ink"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Ingest success */}
          {ingestSuccess && ingestResult && (
            <div className="p-4 rounded-lg bg-ox-signal-pass/10 border border-ox-signal-pass/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-ox-signal-pass shrink-0" />
                <div>
                  <h4 className="font-bold text-ox-ink text-sm flex items-center gap-2">
                    {ingestResult.duplicate ? "Already published" : "Experience published"}
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm bg-ox-surface text-ox-muted border border-ox-edge">
                      {ingestResult.assigned_id}
                    </span>
                  </h4>
                  <p className="text-xs text-ox-muted mt-0.5">
                    {ingestResult.message ||
                      `Total experiences in dataset: ${ingestResult.total_experiences}`}
                  </p>
                </div>
              </div>

              <a
                href={`/experiences/${ingestResult.assigned_id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-ox-accent hover:underline"
              >
                <span>View experience</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          )}

          {ingestError && (
            <div className="p-3 rounded-lg bg-ox-signal-fail/10 border border-ox-signal-fail/30 text-ox-signal-fail text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{ingestError}</span>
            </div>
          )}

          {activeTab === "structured" && (
            <div className="space-y-4">
              <RoundViewer rounds={experience.rounds} />

              {experience.tips && experience.tips.length > 0 && (
                <div className="bg-ox-surface border border-ox-edge rounded-lg p-4">
                  <h4 className="font-semibold text-ox-ink text-sm mb-2">
                    Candidate tips & strategy
                  </h4>
                  <ul className="space-y-1.5 text-xs text-ox-ink/80">
                    {experience.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-ox-signal-pass shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "lossless" && (
            <LosslessViewer
              uiDocument={result.ui_document}
              rawText={experience.raw_text}
              sourceFilename={result.ui_document?.source?.filename}
            />
          )}

          {activeTab === "json" && (
            <div className="bg-ox-surface border border-ox-edge rounded-lg p-4">
              <pre className="p-4 rounded-md bg-ox-void text-ox-signal-pass font-mono text-xs overflow-x-auto max-h-[700px] leading-relaxed">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
