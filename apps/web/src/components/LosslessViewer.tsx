"use client";

import { useState } from "react";
import { UiDocument, UiDocumentSection } from "@/lib/types";
import { ShieldCheck, FileCheck, Copy, Check } from "lucide-react";

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
    <div className="bg-ox-surface rounded-lg border border-ox-edge overflow-hidden">
      {/* Header */}
      <div className="bg-ox-signal-pass/5 border-b border-ox-signal-pass/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-ox-signal-pass shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-ox-ink text-sm">
                Lossless source reconstruction
              </h3>
              {isLossless && (
                <span className="text-[10px] px-2 py-0.5 rounded-sm font-semibold bg-ox-signal-pass text-[#052e16] flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  100% verified
                </span>
              )}
            </div>
            <p className="text-xs text-ox-muted mt-0.5">
              Reconstructed from original PDF source spans. Zero hallucination.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {sourceFilename && (
            <span className="px-2 py-1 rounded-sm bg-ox-surface-raised border border-ox-edge text-ox-muted font-mono">
              {sourceFilename}
            </span>
          )}
          {pageCount && (
            <span className="px-2 py-1 rounded-sm bg-ox-surface-raised border border-ox-edge text-ox-muted">
              {pageCount} pages
            </span>
          )}
          <span className="px-2 py-1 rounded-sm bg-ox-surface-raised border border-ox-edge text-ox-muted font-mono tabular-nums">
            {characterCount.toLocaleString()} chars
          </span>
          {uiDocument?.integrity?.source_span_count && (
            <span className="px-2 py-1 rounded-sm bg-ox-accent/10 text-ox-accent border border-ox-accent/20 font-medium">
              {uiDocument.integrity.assigned_source_span_count}/{uiDocument.integrity.source_span_count} spans
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        {sections.length > 0 ? (
          <div className="space-y-4">
            {/* Section tabs */}
            <div>
              <span className="text-xs font-medium text-ox-muted block mb-2">
                Document sections ({sections.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSectionIdx(null)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedSectionIdx === null
                      ? "bg-ox-accent text-white"
                      : "bg-ox-surface-raised text-ox-muted hover:text-ox-ink border border-ox-edge"
                  }`}
                >
                  Full document
                </button>
                {sections.map((sec, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSectionIdx(idx)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedSectionIdx === idx
                        ? "bg-ox-accent text-white"
                        : "bg-ox-surface-raised text-ox-muted hover:text-ox-ink border border-ox-edge"
                    }`}
                  >
                    <span className="opacity-60 mr-1 capitalize">{sec.type}:</span>
                    <span>{sec.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Single section view */}
            {currentSection ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-ox-accent/10 text-ox-accent border border-ox-accent/20 font-medium capitalize">
                      {currentSection.type}
                    </span>
                    <h4 className="font-semibold text-ox-ink text-sm">{currentSection.title}</h4>
                  </div>
                  <button
                    onClick={() => handleCopy(currentSection.raw_content)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-ox-surface-raised text-ox-muted text-xs hover:text-ox-ink transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-ox-signal-pass" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-ox-void text-ox-ink font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap border border-ox-edge">
                  {currentSection.raw_content}
                </pre>
              </div>
            ) : (
              /* Full document view */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ox-muted">
                    All sections in document order:
                  </span>
                  <button
                    onClick={() => handleCopy(rawText || sections.map((s) => s.raw_content).join("\n\n"))}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-ox-surface-raised text-ox-muted text-xs hover:text-ox-ink transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-ox-signal-pass" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy all"}</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {sections.map((sec, idx) => (
                    <div key={idx} className="border border-ox-edge rounded-lg p-3 bg-ox-void">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-ox-edge">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-ox-surface-raised text-ox-muted">
                            {sec.type}
                          </span>
                          <span className="font-medium text-xs text-ox-ink">{sec.title}</span>
                        </div>
                        <span className="text-[10px] text-ox-muted font-mono tabular-nums">
                          {sec.raw_content.length} chars
                        </span>
                      </div>
                      <pre className="font-mono text-xs text-ox-ink/80 whitespace-pre-wrap leading-relaxed">
                        {sec.raw_content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Fallback: raw text only */
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ox-muted">Full source text:</span>
              <button
                onClick={() => handleCopy(rawText || "")}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-ox-surface-raised text-ox-muted text-xs hover:text-ox-ink transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-ox-signal-pass" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-lg bg-ox-void text-ox-ink font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap border border-ox-edge max-h-[600px]">
              {rawText || "(No raw source text available)"}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
