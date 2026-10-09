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
    <div className="bg-ox-surface border border-ox-edge rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ox-edge">
        <div className="min-w-0">
          {title && (
            <h3 className="text-sm font-semibold text-ox-ink truncate">{title}</h3>
          )}
          {subtitle && (
            <p className="text-xs text-ox-muted mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-ox-muted font-mono tabular-nums">
            {wordCount.toLocaleString()} words
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-ox-muted hover:text-ox-ink transition-colors px-2 py-1 rounded-md hover:bg-ox-surface-raised"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-ox-signal-pass" />
                <span>Copied</span>
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
      <div className="p-4 overflow-auto max-h-[70vh]">
        <pre className="font-mono text-[13px] leading-relaxed text-ox-ink whitespace-pre-wrap break-words">
          {content}
        </pre>
      </div>
    </div>
  );
}
