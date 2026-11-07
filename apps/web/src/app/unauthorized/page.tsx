import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-12 h-12 bg-ox-surface-raised border border-ox-edge rounded-lg flex items-center justify-center mb-5">
        <ShieldAlert className="w-6 h-6 text-ox-signal-fail" />
      </div>
      <h1 className="text-3xl font-bold text-ox-ink font-geist tracking-tight mb-3">
        Access Denied
      </h1>
      <p className="text-ox-muted max-w-md mb-8 text-lg leading-relaxed">
        This platform is strictly restricted to students and alumni of PSG iTech. You must sign in using a valid <strong>@psgitech.ac.in</strong> email address.
      </p>
      
      <Link
        href="/"
        className="ui-action-secondary"
      >
        Return to Home
      </Link>
    </div>
  );
}
