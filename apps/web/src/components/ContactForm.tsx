"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const TYPES = [
  { value: "removal", label: "Remove a record about me" },
  { value: "correction", label: "Correct a record" },
  { value: "bug", label: "Report a problem" },
  { value: "other", label: "Something else" },
];

const inputCls =
  "w-full rounded-md border border-ox-edge bg-ox-void px-3 py-2.5 text-sm text-ox-ink placeholder:text-ox-muted focus:border-ox-accent focus:outline-none focus:ring-2 focus:ring-ox-accent/25";

export default function ContactForm({
  defaultType = "removal",
  defaultRecordUrl = "",
}: {
  defaultType?: string;
  defaultRecordUrl?: string;
}) {
  const [type, setType] = useState(defaultType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [recordUrl, setRecordUrl] = useState(defaultRecordUrl);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/removal-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, email, recordUrl, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit the request");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the request");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-ox-edge bg-ox-surface p-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-ox-signal-pass" />
        <h2 className="text-lg font-semibold text-ox-ink">Request received</h2>
        <p className="max-w-sm text-sm text-ox-text">
          An administrator will review it. If the request concerns a live record,
          expect a follow-up at the email address you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ox-ink">What do you need?</span>
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
          {TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ox-ink">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Optional"
            autoComplete="name"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ox-ink">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ox-ink">Record URL</span>
        <input
          value={recordUrl}
          onChange={(e) => setRecordUrl(e.target.value)}
          className={inputCls}
          placeholder="https://0x-trace.vercel.app/experiences/..."
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ox-ink">Details</span>
        <textarea
          required
          minLength={20}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputCls + " min-h-[140px] resize-y"}
          placeholder="Describe what should be removed or corrected, and why."
        />
      </label>

      {/* Honeypot. Hidden from people, filled by bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-ox-signal-fail/40 bg-ox-signal-fail/10 px-4 py-3 text-sm text-ox-signal-fail">
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="ui-action-primary disabled:opacity-50">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Send request
          </>
        )}
      </button>
    </form>
  );
}
