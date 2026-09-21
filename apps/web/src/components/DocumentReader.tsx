"use client";

import { useState, useMemo } from "react";
import { Copy, Check, FileText } from "lucide-react";

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

  return (
    <div className={`rounded-2xl border border-slate-800 bg-[#0c1017] overflow-hidden shadow-lg ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#0e1320] border-b border-slate-800/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                100% Verbatim
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {subtitle} · <span className="font-semibold text-slate-300">{wordCount} words</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Clean Raw Content View */}
      <div className="p-5 sm:p-6 bg-[#080b11]">
        <pre className="text-slate-200 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto selection:bg-indigo-600 selection:text-white">
          {content || "(No transcript content recorded)"}
        </pre>
      </div>
    </div>
  );
}
