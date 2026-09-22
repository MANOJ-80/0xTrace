"use client";

import { useState } from "react";
import { ExtractionResponse } from "@/lib/types";
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
} from "lucide-react";

interface ExtractionStudioProps {
  initialSample?: ExtractionResponse | null;
}

export default function ExtractionStudio({ initialSample }: ExtractionStudioProps) {
  const [selectedSample, setSelectedSample] = useState<"walmart" | "phonepe" | "idfc" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResponse | null>(initialSample || null);
  const [activeTab, setActiveTab] = useState<"structured" | "lossless" | "json">("structured");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(false);
  const [ingestResult, setIngestResult] = useState<{ assigned_id: string; total_experiences: number } | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const handleApproveAndIngest = async () => {
    if (!result?.experiences?.[0]) return;
    setIsIngesting(true);
    setIngestError(null);
    try {
      const res = await fetch("/api/canonical/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experience: result.experiences[0] }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.detail || "Ingestion failed.");
      }
      setIngestSuccess(true);
      setIngestResult(data);
    } catch (err: any) {
      setIngestError(err.message || "Failed to commit experience to canonical dataset.");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleLoadSample = async (name: "walmart" | "phonepe" | "idfc") => {
    setSelectedSample(name);
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sample?name=${name}`);
      if (!res.ok) throw new Error("Could not load sample fixture");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to load sample");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSelectedSample(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(
        `${err.message}. (Note: Ensure the backend is running with GROQ_API_KEY set, or try one of the preloaded verified samples below!)`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const experience = result?.experiences?.[0];

  return (
    <div className="space-y-6">
      {/* Upload section */}
      <div className="bg-ox-surface border border-ox-edge rounded-lg p-6 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-2 text-center">
          <h2 className="text-xl font-bold text-ox-ink">
            PDF extraction studio
          </h2>
          <p className="text-sm text-ox-muted">
            Upload an interview experience PDF to parse structured rounds, questions, and coding challenges with lossless source fidelity.
          </p>
        </div>

        {/* Upload form */}
        <form onSubmit={handleFileUpload} className="mt-6 max-w-xl mx-auto space-y-4">
          <div className="border-2 border-dashed border-ox-edge hover:border-ox-accent rounded-lg p-6 text-center cursor-pointer transition-colors bg-ox-void">
            <input
              type="file"
              accept=".pdf,application/pdf"
              id="pdf-upload"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
            />
            <label htmlFor="pdf-upload" className="cursor-pointer block space-y-2">
              <Upload className="w-6 h-6 text-ox-accent mx-auto" />
              <div className="text-sm font-medium text-ox-ink">
                {file ? file.name : "Select or drop a PDF file"}
              </div>
              <p className="text-xs text-ox-muted">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF up to 10MB"}
              </p>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold text-ox-ink bg-ox-surface border-2 border-ox-ink shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_currentColor] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Extract from PDF</span>
              </>
            )}
          </button>
        </form>

        {/* Sample fixtures */}
        <div className="mt-6 pt-5 border-t border-ox-edge max-w-2xl mx-auto">
          <div className="text-xs font-medium text-ox-muted text-center mb-3">
            Or test with preloaded verified samples:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {([
              { key: "walmart" as const, label: "Candidate — Walmart", desc: "4 rounds · 23 questions · 3 coding" },
              { key: "phonepe" as const, label: "Candidate — PhonePe", desc: "4 rounds · 6,086 chars · lossless" },
              { key: "idfc" as const, label: "Praveen — IDFC First", desc: "5 rounds · normalized headings" },
            ]).map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => handleLoadSample(key)}
                className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                  selectedSample === key
                    ? "border-ox-accent bg-ox-accent/10 text-ox-ink"
                    : "border-ox-edge bg-ox-void hover:border-ox-accent text-ox-muted"
                }`}
              >
                <div className="font-semibold text-ox-ink">{label}</div>
                <div className="text-[11px] text-ox-muted mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
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

      {/* Results workbench */}
      {result && experience && (
        <div className="space-y-4">
          {/* Status bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-ox-surface border border-ox-edge rounded-lg p-4">
            <div>
              <h3 className="font-bold text-ox-ink text-sm flex items-center gap-2">
                {experience.company?.name || "Extracted company"}
                <span className="text-xs px-2 py-0.5 rounded-sm font-medium bg-ox-signal-pass/10 text-ox-signal-pass border border-ox-signal-pass/20 capitalize">
                  {experience.outcome?.status || "Draft"}
                </span>
              </h3>
              <p className="text-xs text-ox-muted mt-0.5">
                {experience.job?.role || "Software Engineer"} · {experience.rounds?.length || 0} rounds detected
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleApproveAndIngest}
                disabled={isIngesting || ingestSuccess}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  ingestSuccess
                    ? "bg-ox-signal-pass text-[#052e16] cursor-default"
                    : "bg-ox-signal-pass text-[#052e16] border-2 border-[#052e16] shadow-[3px_3px_0_#052e16] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#052e16] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
                }`}
              >
                {isIngesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Ingesting...</span>
                  </>
                ) : ingestSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & publish</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* View mode tabs */}
          <div className="flex items-center gap-0 border-b border-ox-edge">
            {([
              { key: "structured" as const, label: "Structured view", icon: Layers },
              { key: "lossless" as const, label: "Lossless source", icon: ShieldCheck },
              { key: "json" as const, label: "Raw JSON", icon: Code },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
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

          {/* Ingest success banner */}
          {ingestSuccess && ingestResult && (
            <div className="p-4 rounded-lg bg-ox-signal-pass/10 border border-ox-signal-pass/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-ox-signal-pass shrink-0" />
                <div>
                  <h4 className="font-bold text-ox-ink text-sm flex items-center gap-2">
                    Experience ingested
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm bg-ox-surface text-ox-muted border border-ox-edge">
                      {ingestResult.assigned_id}
                    </span>
                  </h4>
                  <p className="text-xs text-ox-muted mt-0.5">
                    Total experiences in dataset: {ingestResult.total_experiences}
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

          {/* Ingest error */}
          {ingestError && (
            <div className="p-3 rounded-lg bg-ox-signal-fail/10 border border-ox-signal-fail/30 text-ox-signal-fail text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{ingestError}</span>
            </div>
          )}

          {/* Structured view */}
          {activeTab === "structured" && (
            <div className="space-y-4">
              <RoundViewer rounds={experience.rounds} />

              {experience.tips && experience.tips.length > 0 && (
                <div className="bg-ox-surface border border-ox-edge rounded-lg p-4">
                  <h4 className="font-semibold text-ox-ink text-sm mb-2">
                    Candidate tips & strategy
                  </h4>
                  <ul className="space-y-1.5 text-xs text-ox-ink/80">
                    {experience.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-ox-signal-pass shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Lossless view */}
          {activeTab === "lossless" && (
            <LosslessViewer
              uiDocument={result.ui_document}
              rawText={experience.raw_text}
              sourceFilename={result.ui_document?.source?.filename}
            />
          )}

          {/* JSON inspector */}
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
