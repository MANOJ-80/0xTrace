"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, Menu, X, LogIn, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

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
    <header className="site-header sticky top-0 z-40 border-b border-ox-edge bg-ox-void/90 backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-ox-void">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="site-brand flex items-center gap-2.5 group">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="font-geist font-bold text-[15px] tracking-tight text-ox-ink">
              0xTrace
            </span>
          </Link>

          <nav aria-label="Main navigation" className="site-nav hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`site-nav-link px-3 py-2 text-[13px] font-medium transition-colors duration-150 ${
                    isActive
                      ? "text-ox-ink bg-ox-surface-raised"
                      : "text-ox-muted hover:text-ox-ink hover:bg-white/[.035]"
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
                className="ui-action-secondary hidden md:inline-flex"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Upload PDF</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="ui-action-secondary"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="ui-action-secondary px-3"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log in</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-md text-ox-muted hover:text-ox-ink hover:bg-ox-surface-raised transition-colors duration-150"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav aria-label="Mobile navigation" className="md:hidden border-t border-ox-edge bg-ox-surface/95 px-4 pb-4 pt-3 space-y-1">
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
                aria-current={isActive ? "page" : undefined}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
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
              className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-ox-muted hover:text-ox-ink hover:bg-ox-surface-raised transition-colors duration-150"
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
