"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/experiences", label: "Experiences" },
    { href: "/questions", label: "Questions" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ox-edge bg-ox-void/85 backdrop-blur-md">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-geist font-bold text-base tracking-tight text-ox-ink">
              0xTrace
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-ox-ink border-b-2 border-ox-accent"
                      : "text-ox-muted hover:text-ox-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-ox-ink bg-ox-surface border-2 border-ox-ink rounded-md shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_currentColor] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-100"
        >
          <FileUp className="w-3.5 h-3.5" />
          <span>Upload PDF</span>
        </Link>
      </div>
    </header>
  );
}
