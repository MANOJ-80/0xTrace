"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, Menu, X, LogIn, LogOut, Shield } from "lucide-react";
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
    if (session?.user?.isAdmin) {
      navItems.push({ href: "/admin", label: "Admin" });
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ox-edge bg-ox-void/90 backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-ox-void">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 group min-h-[44px] items-center"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-ox-accent/20 border border-ox-accent text-ox-accent font-mono font-bold text-xs">
              0x
            </span>
            <span className="font-geist font-bold text-base sm:text-lg tracking-tight text-ox-ink">
              0xTrace
            </span>
          </Link>

          {/* Desktop Nav */}
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
                  className={`px-3 py-1.5 text-sm font-medium transition-colors duration-150 rounded-md ${
                    isActive
                      ? "text-ox-ink bg-ox-surface-raised font-semibold border-b-2 border-ox-accent"
                      : "text-ox-muted hover:text-ox-ink hover:bg-ox-surface/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
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
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-ox-ink bg-transparent border border-ox-edge rounded-md hover:border-ox-ink transition-all duration-100 min-h-[36px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-ox-ink bg-ox-accent border-2 border-ox-ink rounded-md shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_currentColor] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 min-h-[38px]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile menu toggle button (44x44px touch target) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-ox-muted hover:text-ox-ink hover:bg-ox-surface-raised active:bg-ox-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ox-accent"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ox-edge bg-ox-void px-4 py-3 space-y-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          {session?.user && (
            <div className="px-3 py-2 mb-2 rounded-lg bg-ox-surface border border-ox-edge flex items-center justify-between text-xs text-ox-muted">
              <span className="truncate max-w-[200px] text-ox-ink font-medium">
                {session.user.name || session.user.email}
              </span>
              {session.user.isAdmin && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
          )}

          <nav className="space-y-1">
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
                  className={`flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                    isActive
                      ? "text-ox-ink bg-ox-surface-raised font-semibold border-l-2 border-ox-accent"
                      : "text-ox-muted hover:text-ox-ink hover:bg-ox-surface/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {status === "authenticated" && (
            <div className="pt-3 mt-2 border-t border-ox-edge space-y-2">
              <Link
                href="/upload"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-sm font-semibold text-ox-ink bg-ox-surface border-2 border-ox-ink rounded-lg shadow-neo active:shadow-none min-h-[44px]"
              >
                <FileUp className="w-4 h-4" />
                <span>Upload PDF Experience</span>
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-sm font-semibold text-red-400 bg-red-950/20 border border-red-900/50 rounded-lg hover:bg-red-950/40 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
