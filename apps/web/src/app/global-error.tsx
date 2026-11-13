"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#F5F3EE] text-[#25241F] antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#706D66]">
            0xTrace
          </p>
          <h1 className="mt-3 text-2xl font-medium">The application hit an error.</h1>
          <p className="mt-3 max-w-md text-sm text-[#514F49]">
            Reload the page. If the problem continues, try again in a few minutes.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-md bg-[#A94426] px-4 py-2 text-sm font-medium text-white"
            >
              Reload
            </button>
            <Link
              href="/"
              className="rounded-md border border-[#DEDCD6] bg-[#FFFEFC] px-4 py-2 text-sm font-medium text-[#514F49]"
            >
              Back home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
