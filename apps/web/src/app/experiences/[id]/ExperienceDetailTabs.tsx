"use client";

import { useState } from "react";
import { Experience } from "@/lib/types";
import RoundViewer from "@/components/RoundViewer";
import LosslessViewer from "@/components/LosslessViewer";
import {
  Layers,
  Sparkles,
  FileText,
  CheckCircle2,
  HelpCircle,
  Linkedin,
  Mail,
  Quote,
} from "lucide-react";

interface ExperienceDetailTabsProps {
  experience: Experience;
}

export default function ExperienceDetailTabs({ experience }: ExperienceDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"rounds" | "insights" | "raw">("rounds");

  const questionCount = (experience.rounds || []).reduce(
    (acc, r) => acc + (r.questions?.length || 0),
    0
  );
  const codingCount = (experience.rounds || []).reduce(
    (acc, r) => acc + (r.coding?.problems?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab("rounds")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "rounds"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Interview Rounds & Questions</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
            {experience.rounds?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "insights"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Preparation Tips & Advice</span>
          {(experience.tips?.length || 0) > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-medium">
              {experience.tips.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("raw")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "raw"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Lossless Source Text</span>
        </button>
      </div>

      {/* Tab 1: Rounds & Questions */}
      {activeTab === "rounds" && (
        <RoundViewer rounds={experience.rounds} />
      )}

      {/* Tab 2: Insights, Tips & Conclusion */}
      {activeTab === "insights" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preparation Tips */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Candidate Preparation Tips</span>
            </h3>

            {experience.tips && experience.tips.length > 0 ? (
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                {experience.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No standalone tips recorded for this candidate.</p>
            )}
          </div>

          {/* Conclusion & Reflections */}
          <div className="space-y-6">
            {experience.conclusion && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <Quote className="w-4 h-4 text-indigo-500" />
                  <span>Conclusion & Final Reflections</span>
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic bg-indigo-50/40 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                  "{experience.conclusion}"
                </p>
              </div>
            )}

            {/* Contacts & Networking */}
            {(experience.contacts?.linkedin || experience.contacts?.email) && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Candidate Contact Information
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {experience.contacts.linkedin && (
                    <a
                      href={experience.contacts.linkedin.startsWith("http") ? experience.contacts.linkedin : `https://${experience.contacts.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                  {experience.contacts.email && (
                    <a
                      href={`mailto:${experience.contacts.email}`}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{experience.contacts.email}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Verbatim Raw Text View */}
      {activeTab === "raw" && (
        <LosslessViewer
          rawText={experience.raw_text}
          sourceFilename={experience.source?.file_name}
        />
      )}
    </div>
  );
}
