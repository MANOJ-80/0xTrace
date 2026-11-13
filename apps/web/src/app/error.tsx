"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-ox-signal-fail/30 bg-ox-signal-fail/10">
        <AlertTriangle className="h-6 w-6 text-ox-signal-fail" />
      </div>
      <p className="page-kicker">Something went wrong</p>
      <h1 className="page-title mt-2">This page could not load.</h1>
      <p className="page-description mx-auto mt-3 max-w-md text-center">
        The server returned an error. Try again, or go back to the archive.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-ox-muted">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="ui-action-primary">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link href="/" className="ui-action-secondary">
          Back home
        </Link>
      </div>
    </div>
  );
}
