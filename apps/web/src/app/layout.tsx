import type { Metadata } from "next";
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
    "126 audited campus placement experiences with verbatim questions, round breakdowns, and lossless source preservation.",
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
      "126 audited campus placement experiences with verbatim questions, round breakdowns, and lossless source preservation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "0xTrace — Campus Interview Intelligence",
    description:
      "126 audited campus placement experiences with verbatim questions, round breakdowns, and lossless source preservation.",
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
          <Navbar />
          <main className="flex-1 w-full max-w-container mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 min-w-0">
            {children}
          </main>
          <footer className="border-t border-ox-edge py-6 text-center text-xs text-ox-muted bg-ox-void">
            <div className="max-w-container mx-auto px-4 space-y-1">
              <div>
                <span className="font-semibold text-ox-ink">0xTrace</span> &copy; {new Date().getFullYear()} · Campus Placement Intelligence
              </div>
              <p className="text-[11px] text-ox-muted/70">Built for PSG iTech & PSG Tech</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
