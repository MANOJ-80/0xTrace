"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface DocumentReaderProps {
  content: string;
  title?: string;
  subtitle?: string;
}

export default function DocumentReader({ content, title, subtitle }: DocumentReaderProps) {
  const [copied, setCopied] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-ox-surface border border-ox-edge rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 sm:px-5 py-3 border-b border-ox-edge gap-2 sm:gap-4 bg-ox-void/50">
        <div className="min-w-0 flex-1">
          {title && (
            <h3 className="text-xs sm:text-sm font-semibold text-ox-ink truncate">{title}</h3>
          )}
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-ox-muted mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-[11px] sm:text-xs text-ox-muted font-mono tabular-nums">
            {wordCount.toLocaleString()} words
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-ox-muted hover:text-ox-ink transition-colors px-2.5 py-1.5 rounded-lg border border-ox-edge hover:bg-ox-surface-raised min-h-[34px]"
            aria-label="Copy transcript"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-ox-signal-pass" />
                <span className="text-ox-signal-pass font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-5 overflow-auto max-h-[65vh] sm:max-h-[70vh]">
        <pre className="font-mono text-xs sm:text-[13px] leading-relaxed text-ox-ink whitespace-pre-wrap break-words selection:bg-ox-accent selection:text-white">
          {content}
        </pre>
      </div>
    </div>
  );
}
