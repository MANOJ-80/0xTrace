import { Sparkles, Hammer } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Upload PDF — 0xTrace",
  description: "AI-powered PDF extraction coming soon.",
};

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-12 h-12 bg-ox-surface-raised border border-ox-edge rounded-lg flex items-center justify-center mb-5">
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
          className="ui-action-primary"
        >
          <Sparkles className="w-4 h-4" />
          Write Experience Manually
        </Link>
        <Link
          href="/experiences"
          className="ui-action-secondary"
        >
          Browse Database
        </Link>
      </div>
      
      <div className="mt-10 border-t border-ox-edge pt-3 text-xs text-ox-muted">
        In development
      </div>
    </div>
  );
}
