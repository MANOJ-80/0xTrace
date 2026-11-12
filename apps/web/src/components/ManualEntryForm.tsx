"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Experience } from "@/lib/types";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Building2,
  User,
  Briefcase,
  CalendarDays,
  ListChecks,
  MessageSquare,
  Code2,
  Trophy,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface QuestionDraft {
  question: string;
  topic: string;
  difficulty: string;
  category: string;
}

interface CodingDraft {
  title: string;
  description: string;
  difficulty: string;
  topics: string;
}

interface RoundDraft {
  name: string;
  type: string;
  mode: string;
  duration: string;
  difficulty: string;
  description: string;
  questions: QuestionDraft[];
  coding: CodingDraft[];
}

interface FormState {
  /* Step 1 */
  companyName: string;
  role: string;
  employmentType: string;
  location: string;
  candidateName: string;
  department: string;
  degree: string;
  college: string;
  cgpa: string;
  month: string;
  year: string;
  driveType: string;
  /* Step 2 */
  rounds: RoundDraft[];
  /* Step 3 */
  outcome: string;
  ctc: string;
  tips: string;
  mistakes: string;
  conclusion: string;
  linkedin: string;
}

const EMPTY_QUESTION: QuestionDraft = { question: "", topic: "", difficulty: "", category: "technical" };
const EMPTY_CODING: CodingDraft = { title: "", description: "", difficulty: "", topics: "" };
const EMPTY_ROUND: RoundDraft = {
  name: "",
  type: "technical_interview",
  mode: "offline",
  duration: "",
  difficulty: "",
  description: "",
  questions: [],
  coding: [],
};

const ROUND_TYPES = [
  { value: "coding_test", label: "Coding Test" },
  { value: "online_assessment", label: "Online Assessment" },
  { value: "technical_interview", label: "Technical Interview" },
  { value: "hr_interview", label: "HR Interview" },
  { value: "group_discussion", label: "Group Discussion" },
  { value: "other", label: "Other" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STEPS = [
  { label: "Basic Info", icon: Building2 },
  { label: "Rounds", icon: ListChecks },
  { label: "Outcome & Advice", icon: Trophy },
  { label: "Review", icon: CheckCircle2 },
];

/* ------------------------------------------------------------------ */
/*  Reusable Field Components                                          */
/* ------------------------------------------------------------------ */

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-ox-ink">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-ox-void border border-ox-edge rounded-md px-3 py-2.5 text-sm text-ox-ink placeholder:text-ox-muted focus:outline-none focus:ring-2 focus:ring-ox-accent/25 focus:border-ox-accent transition-colors";
const selectCls = inputCls + " appearance-none";
const textareaCls = inputCls + " min-h-[100px] resize-y";

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

interface ManualEntryFormProps {
  initialExperience?: Experience;
  experienceId?: string;
  mode?: "create" | "edit";
  hasPublished?: boolean;
  isAdmin?: boolean;
  /** Admin edits return to the admin console instead of the author pages. */
  adminMode?: boolean;
}

export default function ManualEntryForm({
  initialExperience,
  experienceId,
  mode = "create",
  hasPublished = false,
  isAdmin = false,
  adminMode = false,
}: ManualEntryFormProps = {}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(() => {
    if (initialExperience) {
      return {
        companyName:
          initialExperience.company?.name ||
          initialExperience.company?.normalized_name ||
          "",
        role: initialExperience.job?.role || "",
        employmentType: initialExperience.job?.employment_type || "",
        location: initialExperience.job?.location || "",
        candidateName: initialExperience.candidate?.name || "",
        department: initialExperience.candidate?.department || "",
        degree: initialExperience.candidate?.degree || "",
        college: initialExperience.candidate?.college || "",
        cgpa:
          initialExperience.candidate?.cgpa != null
            ? String(initialExperience.candidate.cgpa)
            : "",
        month: initialExperience.timeline?.month || "",
        year:
          initialExperience.timeline?.year != null
            ? String(initialExperience.timeline.year)
            : "",
        driveType: initialExperience.timeline?.drive_type || "campus",
        rounds:
          initialExperience.rounds && initialExperience.rounds.length > 0
            ? initialExperience.rounds.map((r) => ({
                name: r.original_name || r.name.replace(/^Round \d+:\s*/, ""),
                type: r.type || "technical_interview",
                mode: r.mode || "offline",
                duration: r.duration || "",
                difficulty: r.difficulty || "",
                description: r.description || r.raw_content || "",
                questions: (r.questions || []).map((q: any) => ({
                  question: typeof q === "string" ? q : q.question || "",
                  topic: typeof q === "string" ? "" : q.topic || "",
                  difficulty: typeof q === "string" ? "" : q.difficulty || "",
                  category:
                    typeof q === "string" ? "technical" : q.category || "technical",
                })),
                coding: (r.coding?.problems || []).map((c: any) => ({
                  title: typeof c === "string" ? c : c.title || "",
                  description: typeof c === "string" ? "" : c.description || "",
                  difficulty: typeof c === "string" ? "" : c.difficulty || "",
                  topics:
                    typeof c === "string" ? "" : (c.topics || []).join(", "),
                })),
              }))
            : [{ ...EMPTY_ROUND }],
        outcome: initialExperience.outcome?.status || "unknown",
        ctc:
          initialExperience.compensation?.ctc != null
            ? String(initialExperience.compensation.ctc)
            : "",
        tips: (initialExperience.tips || []).join("\n"),
        mistakes: (initialExperience.mistakes || []).join("\n"),
        conclusion: initialExperience.conclusion || "",
        linkedin: initialExperience.contacts?.linkedin || "",
      };
    }

    return {
      companyName: "",
      role: "",
      employmentType: "",
      location: "",
      candidateName: "",
      department: "",
      degree: "",
      college: "",
      cgpa: "",
      month: "",
      year: "",
      driveType: "campus",
      rounds: [{ ...EMPTY_ROUND }],
      outcome: "unknown",
      ctc: "",
      tips: "",
      mistakes: "",
      conclusion: "",
      linkedin: "",
    };
  });

  /* ---------- helpers ---------- */
  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const updateRound = (idx: number, patch: Partial<RoundDraft>) =>
    setForm((prev) => ({
      ...prev,
      rounds: prev.rounds.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));

  const addRound = () => set("rounds", [...form.rounds, { ...EMPTY_ROUND }]);

  const removeRound = (idx: number) => {
    if (form.rounds.length <= 1) return;
    set("rounds", form.rounds.filter((_, i) => i !== idx));
  };

  const addQuestion = (ri: number) =>
    updateRound(ri, { questions: [...form.rounds[ri].questions, { ...EMPTY_QUESTION }] });

  const removeQuestion = (ri: number, qi: number) =>
    updateRound(ri, { questions: form.rounds[ri].questions.filter((_, i) => i !== qi) });

  const updateQuestion = (ri: number, qi: number, patch: Partial<QuestionDraft>) =>
    updateRound(ri, {
      questions: form.rounds[ri].questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)),
    });

  const addCoding = (ri: number) =>
    updateRound(ri, { coding: [...form.rounds[ri].coding, { ...EMPTY_CODING }] });

  const removeCoding = (ri: number, ci: number) =>
    updateRound(ri, { coding: form.rounds[ri].coding.filter((_, i) => i !== ci) });

  const updateCoding = (ri: number, ci: number, patch: Partial<CodingDraft>) =>
    updateRound(ri, {
      coding: form.rounds[ri].coding.map((c, i) => (i === ci ? { ...c, ...patch } : c)),
    });

  /* ---------- validation ---------- */
  const canProceed = (): boolean => {
    if (step === 0) return form.companyName.trim().length > 0;
    if (step === 1) return form.rounds.every((r) => r.name.trim().length > 0 && r.description.trim().length > 0);
    return true;
  };

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    // Edit mode must merge into the stored record, not replace it. Fields the
    // form does not expose (author, eligibility, contacts email/phone, quality,
    // raw_text, pre-placement data) are preserved by the leading spread.
    const existing = mode === "edit" ? initialExperience : undefined;

    const experience: any = {
      ...(existing || {}),
      id: existing?.id || "exp_draft",
      source: {
        ...(existing?.source || {}),
        entry_method: existing?.source?.entry_method || "manual",
      },
      candidate: {
        ...(existing?.candidate || {}),
        name: form.candidateName || null,
        department: form.department || null,
        degree: form.degree || null,
        college: form.college || null,
        cgpa: form.cgpa ? parseFloat(form.cgpa) || form.cgpa : null,
      },
      company: {
        ...(existing?.company || {}),
        name: form.companyName,
        normalized_name: form.companyName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      },
      job: {
        ...(existing?.job || {}),
        role: form.role || null,
        employment_type: form.employmentType || null,
        location: form.location || null,
      },
      timeline: {
        ...(existing?.timeline || {}),
        month: form.month || null,
        year: form.year ? parseInt(form.year) : null,
        drive_type: form.driveType || null,
      },
      compensation: {
        ...(existing?.compensation || {}),
        ctc: form.ctc || null,
      },
      rounds: form.rounds.map((r, i) => {
        // Keep per-round metadata the form does not edit (date, venue, platform)
        // when the round position is unchanged.
        const prior = existing?.rounds?.[i];
        return {
          ...(prior || {}),
          sequence: i + 1,
          name: `Round ${i + 1}: ${r.name}`,
          original_name: r.name,
          type: r.type,
          mode: r.mode || null,
          duration: r.duration || null,
          difficulty: r.difficulty || null,
          description: r.description,
          raw_content: r.description,
          questions: r.questions
            .filter((q) => q.question.trim())
            .map((q) => ({
              question: q.question,
              topic: q.topic || null,
              difficulty: q.difficulty || null,
              category: q.category || null,
            })),
          coding: {
            ...(prior?.coding || {}),
            problem_count: r.coding.filter((c) => c.title.trim()).length,
            problems: r.coding
              .filter((c) => c.title.trim())
              .map((c) => ({
                title: c.title,
                description: c.description || null,
                difficulty: c.difficulty || null,
                topics: c.topics
                  ? c.topics.split(",").map((t) => t.trim()).filter(Boolean)
                  : [],
              })),
          },
        };
      }),
      outcome: {
        ...(existing?.outcome || {}),
        status: form.outcome || "unknown",
      },
      tips: form.tips
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
      mistakes: form.mistakes
        .split("\n")
        .map((m) => m.trim())
        .filter(Boolean),
      conclusion: form.conclusion || null,
      contacts: {
        ...(existing?.contacts || {}),
        linkedin: form.linkedin || null,
      },
    };

    if (!existing) {
      experience.eligibility = {};
      experience.additional_information = [];
      experience.quality = { score: 100, issues: [] };
      experience.raw_text = [
        `Company: ${form.companyName}`,
        form.role && `Role: ${form.role}`,
        form.candidateName && `Candidate: ${form.candidateName}`,
        form.conclusion,
        ...form.rounds.map((r, i) => `Round ${i + 1}: ${r.name}\n${r.description}`),
        form.tips && `Tips:\n${form.tips}`,
        form.mistakes && `Mistakes:\n${form.mistakes}`,
      ]
        .filter(Boolean)
        .join("\n\n");
    }

    try {
      if (mode === "edit" && experienceId) {
        const res = await fetch(`/api/experiences/${experienceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(experience),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
        setSuccess({ id: experienceId });
      } else {
        const res = await fetch("/api/canonical/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ experience }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Submission failed");
        setSuccess({ id: data.assigned_id });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  if (mode === "create" && hasPublished && !isAdmin) {
    return (
      <div className="bg-ox-surface border border-ox-edge rounded-lg p-6 sm:p-8">
        <div className="max-w-xl mx-auto space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-ox-signal-warn/10 border border-ox-signal-warn/30 text-ox-signal-warn flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-ox-ink">You have already published an experience</h2>
            <p className="text-sm text-ox-muted">
              Student accounts are limited to one published interview experience. You can review or edit your submission anytime from My Experiences.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="/my-experiences"
              className="ui-action-primary inline-flex items-center gap-2"
            >
              <span>Go to My Experiences</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="form-success max-w-2xl mx-auto py-16 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 border border-green-500/40 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-semibold text-ox-ink">
          {mode === "edit" ? "Experience updated" : "Experience published"}
        </h2>
        <p className="text-ox-muted">
          {mode === "edit" ? (
            <>
              Your changes to{" "}
              <code className="text-ox-accent font-mono">{success.id}</code> have
              been saved.
            </>
          ) : (
            <>
              Your interview experience has been saved as{" "}
              <code className="text-ox-accent font-mono">{success.id}</code>.
            </>
          )}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.push(`/experiences/${success.id}`)}
            className="ui-action-primary"
          >
            View Experience →
          </button>
          {mode === "edit" ? (
            <button
              onClick={() => router.push(adminMode ? "/admin" : "/my-experiences")}
              className="ui-action-secondary"
            >
              {adminMode ? "Back to admin" : "My Experiences"}
            </button>
          ) : (
            <button
              onClick={() => {
                setSuccess(null);
                setStep(0);
                setForm({
                  companyName: "",
                  role: "",
                  employmentType: "",
                  location: "",
                  candidateName: "",
                  department: "",
                  degree: "",
                  college: "",
                  cgpa: "",
                  month: "",
                  year: "",
                  driveType: "campus",
                  rounds: [{ ...EMPTY_ROUND }],
                  outcome: "unknown",
                  ctc: "",
                  tips: "",
                  mistakes: "",
                  conclusion: "",
                  linkedin: "",
                });
              }}
              className="ui-action-secondary"
            >
              Submit Another
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {mode === "create" && (
        isAdmin ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-ox-accent/10 border border-ox-accent/30 text-xs text-ox-accent">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Admin account: Unlimited submissions enabled</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-ox-surface border border-ox-edge text-xs text-ox-muted">
            <AlertTriangle className="w-4 h-4 text-ox-accent flex-shrink-0" />
            <span>Notice: Student accounts can publish one interview experience. You can edit your submission anytime after publishing.</span>
          </div>
        )
      )}

      {/* ---- Step Indicator ---- */}
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <button
              key={s.label}
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-current={active ? "step" : undefined}
              className={`form-step-indicator flex-1 flex items-center gap-2 px-3 py-2.5 rounded-md border text-xs font-semibold transition-all ${
                active
                  ? "border-ox-accent/50 bg-ox-accent/10 text-ox-ink"
                  : done
                  ? "border-green-600/40 bg-green-900/15 text-green-300 cursor-pointer"
                  : "border-ox-edge text-ox-muted cursor-not-allowed"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---- Step Content ---- */}
      <div className="form-step-panel space-y-6">

        {/* ============ STEP 0: Basic Info ============ */}
        {step === 0 && (
          <>
            <div className="flex items-center gap-2 pb-2 border-b border-ox-edge">
              <Building2 className="w-5 h-5 text-ox-accent" />
              <h2 className="text-lg font-bold text-ox-ink">Company & Candidate Info</h2>
            </div>

            {/* Company Section */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ox-muted">Company Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company Name" required>
                  <input className={inputCls} placeholder="e.g. Google" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
                </Field>
                <Field label="Role">
                  <input className={inputCls} placeholder="e.g. Software Developer" value={form.role} onChange={(e) => set("role", e.target.value)} />
                </Field>
                <Field label="Employment Type">
                  <select className={selectCls} value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
                    <option value="">Select...</option>
                    <option value="fte">Full Time</option>
                    <option value="internship">Internship</option>
                    <option value="internship_plus_fte">Internship + FTE</option>
                    <option value="internship_to_fulltime">Internship to Fulltime</option>
                  </select>
                </Field>
                <Field label="Location">
                  <input className={inputCls} placeholder="e.g. Bangalore" value={form.location} onChange={(e) => set("location", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* Candidate Section */}
            <div className="space-y-4 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-ox-muted">Candidate Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Your Name">
                  <input className={inputCls} placeholder="e.g. Candidate H" value={form.candidateName} onChange={(e) => set("candidateName", e.target.value)} />
                </Field>
                <Field label="Department">
                  <input className={inputCls} placeholder="e.g. BE CSE" value={form.department} onChange={(e) => set("department", e.target.value)} />
                </Field>
                <Field label="Degree">
                  <input className={inputCls} placeholder="e.g. B.E." value={form.degree} onChange={(e) => set("degree", e.target.value)} />
                </Field>
                <Field label="College">
                  <input className={inputCls} placeholder="e.g. PSG iTech" value={form.college} onChange={(e) => set("college", e.target.value)} />
                </Field>
                <Field label="CGPA">
                  <input className={inputCls} type="number" step="0.01" placeholder="e.g. 8.5" value={form.cgpa} onChange={(e) => set("cgpa", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-ox-muted">Timeline</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Month">
                  <select className={selectCls} value={form.month} onChange={(e) => set("month", e.target.value)}>
                    <option value="">Select...</option>
                    {MONTHS.map((m) => (<option key={m} value={m}>{m}</option>))}
                  </select>
                </Field>
                <Field label="Year">
                  <input className={inputCls} type="number" placeholder="e.g. 2025" value={form.year} onChange={(e) => set("year", e.target.value)} />
                </Field>
                <Field label="Drive Type">
                  <select className={selectCls} value={form.driveType} onChange={(e) => set("driveType", e.target.value)}>
                    <option value="campus">Campus</option>
                    <option value="off_campus">Off Campus</option>
                    <option value="pool_campus">Pool Campus</option>
                  </select>
                </Field>
              </div>
            </div>
          </>
        )}

        {/* ============ STEP 1: Rounds ============ */}
        {step === 1 && (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-ox-edge">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-ox-accent" />
                <h2 className="text-lg font-bold text-ox-ink">Interview Rounds</h2>
              </div>
              <button
                onClick={addRound}
                className="ui-action-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Round
              </button>
            </div>

            <div className="space-y-6">
              {form.rounds.map((round, ri) => (
                <div key={ri} className="form-round-card overflow-hidden">
                  {/* Round header */}
                  <div className="bg-ox-surface-raised px-4 py-3 flex items-center justify-between border-b border-ox-edge">
                    <span className="text-sm font-bold text-ox-ink">Round {ri + 1}</span>
                    {form.rounds.length > 1 && (
                      <button onClick={() => removeRound(ri)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Round basics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Round Name" required>
                        <input className={inputCls} placeholder="e.g. Online Coding Test" value={round.name} onChange={(e) => updateRound(ri, { name: e.target.value })} />
                      </Field>
                      <Field label="Round Type" required>
                        <select className={selectCls} value={round.type} onChange={(e) => updateRound(ri, { type: e.target.value })}>
                          {ROUND_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                        </select>
                      </Field>
                      <Field label="Mode">
                        <select className={selectCls} value={round.mode} onChange={(e) => updateRound(ri, { mode: e.target.value })}>
                          <option value="">Select...</option>
                          <option value="online">Online</option>
                          <option value="offline">Offline</option>
                        </select>
                      </Field>
                      <Field label="Duration">
                        <input className={inputCls} placeholder="e.g. 60 minutes" value={round.duration} onChange={(e) => updateRound(ri, { duration: e.target.value })} />
                      </Field>
                      <Field label="Difficulty">
                        <select className={selectCls} value={round.difficulty} onChange={(e) => updateRound(ri, { difficulty: e.target.value })}>
                          <option value="">Select...</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </Field>
                    </div>

                    {/* Description */}
                    <Field label="Your Experience / Walkthrough" required>
                      <div data-color-mode="dark" className="form-markdown-editor mt-1 w-full rounded-md border border-ox-edge overflow-hidden focus-within:border-ox-accent transition-colors">
                        <MDEditor
                          value={round.description}
                          onChange={(val) => updateRound(ri, { description: val || "" })}
                          preview="edit"
                          hideToolbar={false}
                          height={200}
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </div>
                    </Field>

                    {/* Questions sub-section */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ox-muted">
                          <MessageSquare className="w-3.5 h-3.5" /> Interview Questions
                        </span>
                        <button onClick={() => addQuestion(ri)} className="text-xs font-semibold text-ox-accent hover:underline">
                          + Add Question
                        </button>
                      </div>
                      {round.questions.map((q, qi) => (
                        <div key={qi} className="flex gap-2 items-start">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input className={inputCls + " sm:col-span-2"} placeholder="Question text" value={q.question} onChange={(e) => updateQuestion(ri, qi, { question: e.target.value })} />
                            <input className={inputCls} placeholder="Topic" value={q.topic} onChange={(e) => updateQuestion(ri, qi, { topic: e.target.value })} />
                            <select className={selectCls} value={q.difficulty} onChange={(e) => updateQuestion(ri, qi, { difficulty: e.target.value })}>
                              <option value="">Difficulty</option>
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                          <button onClick={() => removeQuestion(ri, qi)} className="text-red-400 hover:text-red-300 p-1.5 mt-0.5">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Coding sub-section */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ox-muted">
                          <Code2 className="w-3.5 h-3.5" /> Coding Problems
                        </span>
                        <button onClick={() => addCoding(ri)} className="text-xs font-semibold text-ox-accent hover:underline">
                          + Add Problem
                        </button>
                      </div>
                      {round.coding.map((c, ci) => (
                        <div key={ci} className="flex gap-2 items-start">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input className={inputCls} placeholder="Problem title" value={c.title} onChange={(e) => updateCoding(ri, ci, { title: e.target.value })} />
                            <input className={inputCls + " sm:col-span-2"} placeholder="Description" value={c.description} onChange={(e) => updateCoding(ri, ci, { description: e.target.value })} />
                            <input className={inputCls} placeholder="Topics (comma sep)" value={c.topics} onChange={(e) => updateCoding(ri, ci, { topics: e.target.value })} />
                          </div>
                          <button onClick={() => removeCoding(ri, ci)} className="text-red-400 hover:text-red-300 p-1.5 mt-0.5">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ============ STEP 2: Outcome & Advice ============ */}
        {step === 2 && (
          <>
            <div className="flex items-center gap-2 pb-2 border-b border-ox-edge">
              <Trophy className="w-5 h-5 text-ox-accent" />
              <h2 className="text-lg font-bold text-ox-ink">Outcome & Advice</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Outcome">
                <select className={selectCls} value={form.outcome} onChange={(e) => set("outcome", e.target.value)}>
                  <option value="unknown">Unknown</option>
                  <option value="selected">Selected ✅</option>
                  <option value="rejected">Rejected ❌</option>
                  <option value="waitlisted">Waitlisted ⏳</option>
                </select>
              </Field>
              <Field label="CTC / Package">
                <input className={inputCls} placeholder="e.g. 12 LPA" value={form.ctc} onChange={(e) => set("ctc", e.target.value)} />
              </Field>
            </div>

            <Field label="Tips for Future Candidates (one per line)">
              <textarea
                className={textareaCls}
                placeholder={"Practice DP and Trees thoroughly\nBe confident during HR rounds\nPrepare your projects well"}
                value={form.tips}
                onChange={(e) => set("tips", e.target.value)}
              />
            </Field>

            <Field label="Mistakes / Pitfalls (one per line)">
              <textarea
                className={textareaCls}
                placeholder={"Didn't practice OS concepts enough\nForgot edge cases in coding round"}
                value={form.mistakes}
                onChange={(e) => set("mistakes", e.target.value)}
              />
            </Field>

            <Field label="Conclusion / Final Thoughts">
              <textarea
                className={inputCls + " min-h-[80px] resize-y"}
                placeholder="Any final remarks about the overall experience..."
                value={form.conclusion}
                onChange={(e) => set("conclusion", e.target.value)}
              />
            </Field>

            <Field label="LinkedIn Profile URL">
              <input className={inputCls} placeholder="https://linkedin.com/in/your-profile" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
            </Field>
          </>
        )}

        {/* ============ STEP 3: Review ============ */}
        {step === 3 && (
          <>
            <div className="flex items-center gap-2 pb-2 border-b border-ox-edge">
              <CheckCircle2 className="w-5 h-5 text-ox-accent" />
              <h2 className="text-lg font-bold text-ox-ink">Review Your Experience</h2>
            </div>

            <div className="space-y-5">
              {/* Company Header */}
              <div className="bg-ox-void border border-ox-edge rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-ox-accent" />
                  <span className="font-bold text-ox-ink">{form.companyName || "—"}</span>
                  {form.outcome && (
                    <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-md border ${
                      form.outcome === "selected" ? "border-green-600 text-green-400 bg-green-900/20" :
                      form.outcome === "rejected" ? "border-red-600 text-red-400 bg-red-900/20" :
                      "border-ox-edge text-ox-muted"
                    }`}>
                      {form.outcome}
                    </span>
                  )}
                </div>
                {form.role && <p className="text-sm text-ox-muted"><Briefcase className="w-3.5 h-3.5 inline mr-1" />{form.role}</p>}
                {form.candidateName && <p className="text-sm text-ox-muted"><User className="w-3.5 h-3.5 inline mr-1" />{form.candidateName}</p>}
                {(form.month || form.year) && <p className="text-sm text-ox-muted"><CalendarDays className="w-3.5 h-3.5 inline mr-1" />{[form.month, form.year].filter(Boolean).join(" ")}</p>}
                {form.ctc && <p className="text-sm text-ox-muted">💰 {form.ctc}</p>}
              </div>

              {/* Rounds Summary */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-ox-muted">Rounds ({form.rounds.length})</p>
                {form.rounds.map((r, i) => (
                  <div key={i} className="bg-ox-void border border-ox-edge rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-sm bg-ox-accent/10 border border-ox-accent/30 text-ox-accent text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="font-semibold text-sm text-ox-ink">{r.name || "Untitled"}</span>
                      <span className="text-xs text-ox-muted px-1.5 py-0.5 border border-ox-edge rounded">{ROUND_TYPES.find((t) => t.value === r.type)?.label || r.type}</span>
                    </div>
                    <p className="text-sm text-ox-muted line-clamp-3">{r.description || "No description"}</p>
                    <div className="flex gap-3 text-xs text-ox-muted">
                      {r.questions.length > 0 && <span>💬 {r.questions.length} questions</span>}
                      {r.coding.length > 0 && <span>💻 {r.coding.length} coding problems</span>}
                      {r.duration && <span>⏱ {r.duration}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips Preview */}
              {form.tips.trim() && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ox-muted flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Tips
                  </p>
                  <ul className="list-disc list-inside text-sm text-ox-muted space-y-1">
                    {form.tips.split("\n").filter(Boolean).map((t, i) => <li key={i}>{t.trim()}</li>)}
                  </ul>
                </div>
              )}

              {form.mistakes.trim() && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ox-muted flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Mistakes
                  </p>
                  <ul className="list-disc list-inside text-sm text-ox-muted space-y-1">
                    {form.mistakes.split("\n").filter(Boolean).map((m, i) => <li key={i}>{m.trim()}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {/* ---- Navigation Buttons ---- */}
      <div className="flex items-center justify-between pb-8">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="ui-action-secondary disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            disabled={!canProceed()}
            className="ui-action-primary disabled:opacity-40 disabled:shadow-none"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="ui-action-primary submit-action disabled:opacity-50"
          >
            {submitting ? (
              <>{mode === "edit" ? "Saving..." : "Submitting..."}</>
            ) : (
              <>
                <Send className="w-4 h-4" />{" "}
                {mode === "edit" ? "Save Changes" : "Submit Experience"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
