"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Lock, LogIn } from "lucide-react";
import { Suspense } from "react";

function LoginCard() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md bg-ox-surface border-2 border-ox-edge rounded-xl shadow-neo p-8 text-center space-y-6">
        
        <div className="mx-auto w-16 h-16 bg-ox-surface-raised border-2 border-ox-edge rounded-2xl flex items-center justify-center shadow-sm">
          <Lock className="w-8 h-8 text-ox-ink" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-ox-ink font-geist tracking-tight">
            Authentication Required
          </h1>
          <p className="text-ox-muted text-sm leading-relaxed">
            You need to sign in with your <strong className="text-ox-ink">@psgitech.ac.in</strong> account to view this content or contribute experiences.
          </p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-ox-ink text-ox-surface font-semibold rounded-lg hover:bg-ox-ink/90 transition-colors shadow-neo active:translate-y-[2px] active:shadow-none"
        >
          <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]">Loading...</div>}>
      <LoginCard />
    </Suspense>
  );
}
