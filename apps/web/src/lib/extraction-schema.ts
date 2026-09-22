import { z } from "zod";

export const ExperienceExtractionSchema = z.object({
  id: z.string().default('exp_draft'),
  source: z.object({
    experience_number: z.number().optional(),
    file_name: z.string().optional(),
    page_count: z.number().optional(),
  }).default({}),
  candidate: z.object({
    name: z.string().nullable().optional(),
    department: z.string().nullable().optional(),
    degree: z.string().nullable().optional(),
    college: z.string().nullable().optional(),
    cgpa: z.union([z.number(), z.string()]).nullable().optional(),
    roll_no: z.string().nullable().optional(),
  }).default({}),
  company: z.object({
    name: z.string().nullable().optional(),
    normalized_name: z.string().nullable().optional(),
  }).default({}),
  job: z.object({
    role: z.string().nullable().optional(),
    employment_type: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
  }).default({}),
  timeline: z.object({
    month: z.string().nullable().optional(),
    year: z.number().nullable().optional(),
    drive_type: z.string().nullable().optional(),
  }).default({}),
  eligibility: z.object({
    min_cgpa: z.number().nullable().optional(),
    branches_eligible: z.array(z.string()).nullable().optional(),
    history_of_arrears: z.boolean().nullable().optional(),
    standing_arrears: z.boolean().nullable().optional(),
  }).default({}),
  compensation: z.object({
    ctc: z.union([z.string(), z.number()]).nullable().optional(),
    base: z.union([z.string(), z.number()]).nullable().optional(),
    stipend: z.union([z.string(), z.number()]).nullable().optional(),
    breakdown: z.string().nullable().optional(),
  }).default({}),
  rounds: z.array(z.object({
    sequence: z.number(),
    name: z.string(),
    original_name: z.string().optional(),
    type: z.string(),
    mode: z.string().nullable().optional(),
    platform: z.string().nullable().optional(),
    duration: z.string().nullable().optional(),
    difficulty: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    raw_content: z.string(),
    questions: z.array(z.object({
      question: z.string(),
      topic: z.string().nullable().optional(),
      difficulty: z.string().nullable().optional(),
      category: z.string().nullable().optional(),
      details: z.string().nullable().optional(),
    })).optional(),
    coding: z.object({
      problem_count: z.number().optional(),
      problems: z.array(z.object({
        title: z.string(),
        description: z.string().nullable().optional(),
        difficulty: z.string().nullable().optional(),
        topics: z.array(z.string()).optional(),
      })).optional(),
    }).optional(),
  })).default([]),
  outcome: z.object({
    status: z.string().nullable().optional(),
    offer_type: z.string().nullable().optional(),
    candidates_selected: z.number().nullable().optional(),
    candidates_appeared: z.number().nullable().optional(),
  }).default({}),
  tips: z.array(z.string()).default([]),
  mistakes: z.array(z.string()).optional(),
  conclusion: z.string().nullable().optional(),
  contacts: z.object({
    email: z.string().nullable().optional(),
    linkedin: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  }).default({}),
  additional_information: z.array(z.string()).default([]),
  quality: z.object({
    score: z.number().optional(),
    issues: z.array(z.string()).optional(),
  }).default({}),
  raw_text: z.string().default(''),
});

import type { Experience } from "@/lib/types";

export function parseExtractionResult(data: unknown, rawText: string, filename: string): Experience {
  const parsed = ExperienceExtractionSchema.safeParse(data);
  if (parsed.success) {
    const exp = parsed.data;
    exp.id = "exp_draft";
    exp.raw_text = rawText;
    if (!exp.rounds || exp.rounds.length === 0) {
      exp.rounds = [{
        sequence: 1,
        name: "Unknown Round",
        type: "unknown",
        raw_content: rawText
      }];
    }
    return exp;
  }
  
  // Minimal valid fallback if parsing fails
  return {
    id: "exp_draft",
    source: { file_name: filename },
    candidate: {},
    company: { name: filename.replace(/[^a-zA-Z0-9]/g, ' ') },
    job: {},
    timeline: {},
    eligibility: {},
    compensation: {},
    rounds: [{
      sequence: 1,
      name: "Unknown Round",
      type: "unknown",
      raw_content: rawText
    }],
    outcome: {},
    tips: [],
    contacts: {},
    additional_information: [],
    quality: { score: 0, issues: ["Failed to parse LLM output"] },
    raw_text: rawText
  };
}
