"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, Menu, X, LogIn, LogOut } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/experiences", label: "Experiences" },
    { href: "/questions", label: "Questions" },
    { href: "/analytics", label: "Analytics" },
    { href: "/about", label: "About" },
  ];

  if (status === "authenticated") {
    navItems.push({ href: "/contribute", label: "Contribute" });
    navItems.push({ href: "/my-experiences", label: "My Experiences" });
    if (session?.user?.isAdmin) {
      navItems.push({ href: "/admin", label: "Admin" });
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ox-edge bg-ox-void/85 backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-ox-void">
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
                  className={`px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
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

        <div className="flex items-center gap-2">
          {status === "authenticated" ? (
            <>
              <Link
                href="/upload"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-ox-ink bg-ox-surface border-2 border-ox-ink rounded-md shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_currentColor] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-100"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Upload PDF</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-ox-ink bg-transparent border-2 border-ox-edge rounded-md hover:border-ox-ink transition-all duration-100"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-ox-ink bg-ox-accent border-2 border-ox-ink rounded-md shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_currentColor] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-100"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-ox-muted hover:text-ox-ink hover:bg-ox-surface-raised transition-colors duration-150"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-ox-edge bg-ox-void px-4 pb-3 pt-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-ox-ink bg-ox-surface-raised"
                    : "text-ox-muted hover:text-ox-ink hover:bg-ox-surface-raised"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {status === "authenticated" && (
            <Link
              href="/upload"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-ox-muted hover:text-ox-ink hover:bg-ox-surface-raised transition-colors duration-150"
            >
              <FileUp className="w-4 h-4" />
              <span>Upload PDF</span>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
