"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Compass,
  HelpCircle,
  FileUp,
  BarChart3,
  Layers,
  Search,
  Bell,
  User,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: BarChart3 },
    { href: "/experiences", label: "Experiences", icon: Compass },
    { href: "/questions", label: "Question Bank", icon: HelpCircle },
    { href: "/upload", label: "PDF Studio", icon: FileUp },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e14]/90 backdrop-blur-md border-b border-[#1a1f2c] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-primary-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
              0x
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  0xTrace
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-950/70 text-indigo-400 border border-indigo-800/60">
                  v1.3
                </span>
              </div>
              <span className="text-[10px] text-slate-400 -mt-0.5">
                College Interview Experiences
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#181d28] text-white border border-[#232938]"
                      : "text-slate-400 hover:text-white hover:bg-[#141722]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/experiences"
            className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800/60 font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>126 Experiences</span>
          </Link>

          <Link
            href="/upload"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
