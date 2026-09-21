"use client";

import { useState, useMemo } from "react";
import { FileText, Copy, Check, ExternalLink, Code2, BookOpen } from "lucide-react";

interface DocumentReaderProps {
  content: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function DocumentReader({
  content,
  title = "Verbatim Experience Transcript",
  subtitle = "Original candidate write-up · Exact text preserved",
  className = "",
}: DocumentReaderProps) {
  const [viewMode, setViewMode] = useState<"doc" | "raw">("doc");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = useMemo(() => {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  // Parse paragraphs and lines for Word/Docs styled rendering
  const renderedBlocks = useMemo(() => {
    if (!content) return [];
    // Split by double newline into conceptual paragraphs
    const paragraphs = content.split(/\n\n+/);

    return paragraphs.map((para, pIdx) => {
      const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return null;

      // Check if all lines are bullets or numbered items
      const isList = lines.every(
        (l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*") || /^\d+[\.\)]\s/.test(l)
      );

      if (isList) {
        return (
          <ul key={pIdx} className="my-2.5 space-y-1.5 pl-1">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^[•\-\*]\s*/, "").replace(/^\d+[\.\)]\s*/, "");
              const numberMatch = line.match(/^(\d+)[\.\)]\s*/);
              return (
                <li key={lIdx} className="flex items-start gap-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {numberMatch ? (
                    <span className="shrink-0 font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-xs mt-0.5 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/50">
                      {numberMatch[1]}
                    </span>
                  ) : (
                    <span className="shrink-0 text-indigo-500 font-bold mt-0.5 select-none">•</span>
                  )}
                  <span className="flex-1">{renderFormattedText(cleanLine)}</span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Check if single line is a title or metadata label (e.g. "Round 1", "Type: Coding")
      if (
        lines.length === 1 &&
        (/^(round\s+\d+|type:|mode:|duration:|difficulty|sections:|format:|platform:)/i.test(lines[0]) ||
          (lines[0].length < 40 && lines[0].endsWith(":")))
      ) {
        return (
          <div key={pIdx} className="pt-2 pb-1 border-b border-slate-100 dark:border-slate-800/60 first:pt-0">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {renderFormattedText(lines[0])}
            </span>
          </div>
        );
      }

      // Standard paragraph
      return (
        <p key={pIdx} className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 my-2">
          {lines.map((line, lIdx) => (
            <span key={lIdx}>
              {renderFormattedText(line)}
              {lIdx < lines.length - 1 && " "}
            </span>
          ))}
        </p>
      );
    });
  }, [content]);

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090d16] overflow-hidden ${className}`}>
      {/* Document Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-100/80 dark:bg-[#0e1320] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                100% Verbatim
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {subtitle} · <span className="font-medium">{wordCount} words</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setViewMode("doc")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === "doc"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Doc View</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === "raw"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Document Body Area */}
      <div className="p-4 sm:p-6">
        {viewMode === "doc" ? (
          <div className="bg-white dark:bg-[#0b0f19] rounded-lg p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm max-w-none text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
            {renderedBlocks.length > 0 ? (
              renderedBlocks
            ) : (
              <p className="text-sm text-slate-400 italic">No transcript recorded for this round.</p>
            )}
          </div>
        ) : (
          <pre className="p-4 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap selection:bg-indigo-500 selection:text-white border border-slate-800">
            {content || "(No transcript content recorded)"}
          </pre>
        )}
      </div>
    </div>
  );
}

function renderFormattedText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium break-all"
        >
          <span>{part.replace(/^https?:\/\/(www\.)?/, "")}</span>
          <ExternalLink className="w-3 h-3 inline-block shrink-0" />
        </a>
      );
    }
    return part;
  });
}
