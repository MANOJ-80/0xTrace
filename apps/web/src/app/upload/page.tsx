import { Sparkles, Hammer } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Upload PDF — 0xTrace",
  description: "AI-powered PDF extraction coming soon.",
};

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-ox-surface-raised border-2 border-ox-edge rounded-2xl flex items-center justify-center mb-6 shadow-neo">
        <Hammer className="w-8 h-8 text-ox-accent" />
      </div>
      <h1 className="text-3xl font-bold text-ox-ink font-geist tracking-tight mb-3">
        Automated PDF Extraction
      </h1>
      <p className="text-ox-muted max-w-md mb-8 text-lg leading-relaxed">
        We're currently building a robust, AI-powered extraction engine to automatically parse and digitize your college interview PDFs. This feature will be available soon!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/contribute"
          className="inline-flex justify-center items-center gap-2 px-6 py-3 text-sm font-bold text-ox-surface bg-ox-ink border-2 border-ox-ink rounded-lg shadow-[4px_4px_0_theme(colors.ox.accent)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_theme(colors.ox.accent)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Write Experience Manually
        </Link>
        <Link
          href="/experiences"
          className="inline-flex justify-center items-center gap-2 px-6 py-3 text-sm font-semibold text-ox-ink bg-ox-surface border-2 border-ox-edge rounded-lg hover:border-ox-accent hover:text-ox-ink transition-colors"
        >
          Browse Database
        </Link>
      </div>
      
      <div className="mt-16 inline-block bg-ox-accent/10 border-2 border-ox-accent text-ox-ink px-4 py-2 rounded-full text-xs font-bold font-mono">
        STATUS: IN DEVELOPMENT
      </div>
    </div>
  );
}
