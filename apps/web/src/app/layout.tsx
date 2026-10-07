import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "0xTrace — Campus Interview Intelligence",
  description:
    "126 audited campus placement experiences with verbatim questions, round breakdowns, and lossless source preservation.",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-geist bg-ox-void text-ox-ink flex flex-col min-h-screen antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        <footer className="border-t border-ox-edge py-5 text-center text-xs text-ox-muted">
          <div className="max-w-container mx-auto px-4">
            <span className="font-semibold text-ox-ink">0xTrace</span> &copy; {new Date().getFullYear()}
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}
