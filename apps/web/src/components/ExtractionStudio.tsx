"use client";

import { useState } from "react";
import { ExtractionResponse } from "@/lib/types";
import RoundViewer from "@/components/RoundViewer";
import LosslessViewer from "@/components/LosslessViewer";
import {
  Upload,
  FileText,
  Sparkles,
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
    <div className="space-y-8">
      {/* Upload Header & Dropzone Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent Pipeline v4 • Evidence-First Lossless Extraction</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Ingest & Audit Interview Experience PDF
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload an interview experience PDF to parse structured rounds, question banks, and coding challenges while maintaining 100% verbatim source fidelity.
          </p>
        </div>

        {/* Upload form */}
        <form onSubmit={handleFileUpload} className="mt-8 max-w-xl mx-auto space-y-4">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/30">
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
              <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {file ? file.name : "Click to select or drag and drop PDF"}
              </div>
              <p className="text-xs text-slate-500">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Accepts PDF up to 10MB"}
              </p>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={!file || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Extraction Pipeline...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Extract with Agent Pipeline</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preloaded Verified Benchmark Samples */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 max-w-2xl mx-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
            Or instantly test with preloaded verified pipeline extractions:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleLoadSample("walmart")}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                selectedSample === "walmart"
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300"
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-slate-100">Candidate — Walmart</div>
              <div className="text-[11px] text-slate-500 mt-0.5">4 rounds • 23 questions • 3 coding</div>
            </button>

            <button
              onClick={() => handleLoadSample("phonepe")}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                selectedSample === "phonepe"
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300"
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-slate-100">Candidate — PhonePe</div>
              <div className="text-[11px] text-slate-500 mt-0.5">4 rounds • 6,086 chars • lossless</div>
            </button>

            <button
              onClick={() => handleLoadSample("idfc")}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                selectedSample === "idfc"
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300"
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-slate-100">Praveen — IDFC First</div>
              <div className="text-[11px] text-slate-500 mt-0.5">5 rounds • normalized headings</div>
            </button>
          </div>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mt-6 max-w-xl mx-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Extraction Notice</p>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Extraction Result Audit Workbench */}
      {result && experience && (
        <div className="space-y-6">
          {/* Top Audit Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                {experience.company?.name?.slice(0, 2).toUpperCase() || "EX"}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  {experience.company?.name || "Extracted Company"}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize font-medium">
                    {experience.outcome?.status || "Draft"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {experience.job?.role || "Software Engineer"} • {experience.rounds?.length || 0} rounds detected
                </p>
              </div>
            </div>

            {/* Actions & View Mode Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleApproveAndIngest}
                disabled={isIngesting || ingestSuccess}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  ingestSuccess
                    ? "bg-emerald-600 text-white cursor-default"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50"
                }`}
              >
                {isIngesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Validating & Ingesting...</span>
                  </>
                ) : ingestSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approved & Published!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Approve & Ingest to Canonical</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("structured")}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    activeTab === "structured"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Canonical</span>
                </button>

                <button
                  onClick={() => setActiveTab("lossless")}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    activeTab === "lossless"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Lossless UI</span>
                </button>

                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    activeTab === "json"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ingest Success Notification Banner */}
          {ingestSuccess && ingestResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    Experience Successfully Ingested!
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-800/60 text-emerald-200 border border-emerald-700/60">
                      {ingestResult.assigned_id}
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-300/90 mt-0.5">
                    Canonical dataset updated. Total experiences in dataset: {ingestResult.total_experiences}.
                  </p>
                </div>
              </div>

              <a
                href={`/experiences/${ingestResult.assigned_id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-emerald-950 hover:bg-emerald-50 shadow-md transition-all self-start sm:self-auto"
              >
                <span>View Live Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Ingest Error Banner */}
          {ingestError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{ingestError}</span>
            </div>
          )}

          {/* Tab 1: Canonical Structured View */}
          {activeTab === "structured" && (
            <div className="space-y-6">
              <RoundViewer rounds={experience.rounds} />

              {/* Tips & Insights block if available */}
              {experience.tips && experience.tips.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">
                    Extracted Candidate Tips & Strategy:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {experience.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Lossless UI Document */}
          {activeTab === "lossless" && (
            <LosslessViewer
              uiDocument={result.ui_document}
              rawText={experience.raw_text}
              sourceFilename={result.ui_document?.source?.filename}
            />
          )}

          {/* Tab 3: Raw JSON Inspector */}
          {activeTab === "json" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[700px] leading-relaxed">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
