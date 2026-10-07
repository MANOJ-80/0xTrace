import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-red-100/10 border-2 border-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0_theme(colors.red.500)]">
        <ShieldAlert className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold text-ox-ink font-geist tracking-tight mb-3">
        Access Denied
      </h1>
      <p className="text-ox-muted max-w-md mb-8 text-lg leading-relaxed">
        This platform is strictly restricted to students and alumni of PSG iTech. You must sign in using a valid <strong>@psgitech.ac.in</strong> email address.
      </p>
      
      <Link
        href="/"
        className="inline-flex justify-center items-center gap-2 px-6 py-3 text-sm font-bold text-ox-ink bg-ox-surface border-2 border-ox-edge rounded-lg hover:border-ox-ink transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
