import type { Metadata } from "next";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Navbar from "@/components/Navbar";

const siteUrl = process.env.NEXTAUTH_URL || "https://0x-trace.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "0xTrace — Campus Interview Intelligence",
    template: "%s | 0xTrace",
  },
  description:
    "Explore campus placement interview experiences with round-by-round questions, company filters, and original candidate accounts preserved.",
  applicationName: "0xTrace",
  keywords: [
    "PSG iTech",
    "PSG Tech",
    "Campus Placements",
    "Interview Experiences",
    "Technical Rounds",
    "Coding Questions",
    "Placement Intelligence",
  ],
  authors: [{ name: "0xTrace" }],
  creator: "0xTrace",
  publisher: "0xTrace",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "0xTrace",
    title: "0xTrace — Campus Interview Intelligence",
    description:
      "Explore campus placement interview experiences with round-by-round questions, company filters, and original candidate accounts preserved.",
  },
  twitter: {
    card: "summary_large_image",
    title: "0xTrace — Campus Interview Intelligence",
    description:
      "Explore campus placement interview experiences with round-by-round questions, company filters, and original candidate accounts preserved.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-geist bg-ox-void text-ox-ink flex flex-col min-h-screen antialiased overflow-x-hidden">
        <Providers>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        <footer className="site-footer border-t border-ox-edge">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <span className="font-semibold text-ox-ink">0xTrace</span>
              <p className="mt-1 text-xs text-ox-text">Campus interview experiences, organized for the next candidate.</p>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ox-text">
              <Link href="/experiences" className="hover:text-ox-ink transition-colors">Experiences</Link>
              <Link href="/questions" className="hover:text-ox-ink transition-colors">Questions</Link>
              <Link href="/about" className="hover:text-ox-ink transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-ox-ink transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-ox-ink transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-ox-ink transition-colors">Contact</Link>
            </nav>
            <span className="text-xs text-ox-text">&copy; {new Date().getFullYear()}</span>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}
