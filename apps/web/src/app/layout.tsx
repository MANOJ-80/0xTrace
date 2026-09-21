import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "0xTrace — Placement Intelligence & Lossless Interview Viewer",
  description:
    "Evidence-first placement intelligence platform powered by canonical V1.3 interview experiences and lossless extraction.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-slate-100 flex flex-col min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">0xTrace</span> • Canonical V1.3 Dataset Invariant & Lossless Source Preservation
            </div>
            <div>
              Built for campus placement candidates & technical interview preparation
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
