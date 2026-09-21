"use client";

import { useState } from "react";
import { UiDocument, UiDocumentSection } from "@/lib/types";
import { ShieldCheck, FileCheck, Layers, Hash, Copy, Check } from "lucide-react";

interface LosslessViewerProps {
  uiDocument?: UiDocument | null;
  rawText?: string;
  sourceFilename?: string;
}

export default function LosslessViewer({
  uiDocument,
  rawText,
  sourceFilename,
}: LosslessViewerProps) {
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const sections = uiDocument?.sections || [];
  const isLossless = uiDocument?.integrity?.lossless ?? true;
  const characterCount =
    uiDocument?.source?.character_count || rawText?.length || 0;
  const pageCount = uiDocument?.source?.page_count;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentSection =
    selectedSectionIdx !== null ? sections[selectedSectionIdx] : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Header with Lossless Verification Banner */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Lossless Source Reconstruction
              </h3>
              {isLossless && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-600 text-white flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  Verified Lossless (100% Fidelity)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Reconstructed directly from original PDF source spans. Zero LLM hallucination in text.
            </p>
          </div>
        </div>

        {/* Audit Metrics */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {sourceFilename && (
            <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">
              {sourceFilename}
            </span>
          )}
          {pageCount && (
            <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              {pageCount} pages
            </span>
          )}
          <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            {characterCount.toLocaleString()} chars
          </span>
          {uiDocument?.integrity?.source_span_count && (
            <span className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
              {uiDocument.integrity.assigned_source_span_count}/{uiDocument.integrity.source_span_count} spans
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {sections.length > 0 ? (
          <div className="space-y-6">
            {/* Section Pills */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                Ordered UI Document Sections ({sections.length})
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSectionIdx(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSectionIdx === null
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  Full Document View
                </button>
                {sections.map((sec, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSectionIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedSectionIdx === idx
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <span className="opacity-60 mr-1.5 capitalize">{sec.type}:</span>
                    <span>{sec.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display single section or all sections */}
            {currentSection ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium capitalize">
                      {currentSection.type}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {currentSection.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(currentSection.raw_content)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs hover:bg-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Section"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap selection:bg-indigo-500 selection:text-white border border-slate-800">
                  {currentSection.raw_content}
                </pre>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Showing all reconstructed sections in natural document order:
                  </span>
                  <button
                    onClick={() => handleCopy(rawText || sections.map((s) => s.raw_content).join("\n\n"))}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs hover:bg-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy All Raw"}</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {sec.type}
                          </span>
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {sec.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {sec.raw_content.length} chars
                        </span>
                      </div>
                      <pre className="font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {sec.raw_content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Full original extracted source text:
              </span>
              <button
                onClick={() => handleCopy(rawText || "")}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs hover:bg-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Raw"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap selection:bg-indigo-500 selection:text-white border border-slate-800 max-h-[600px]">
              {rawText || "(No raw source text available)"}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
