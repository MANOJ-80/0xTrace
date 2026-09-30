import fs from "fs/promises";
import path from "path";
import {
  CanonicalDataset,
  Experience,
  CompanyStats,
  InterviewQuestion,
  CodingProblem,
  ExtractionResponse,
} from "./types";

let cachedDataset: CanonicalDataset | null = null;

export function invalidateCache() {
  cachedDataset = null;
}

export async function getCanonicalDataset(forceRefresh = false): Promise<CanonicalDataset> {
  if (cachedDataset && !forceRefresh) {
    return cachedDataset;
  }

  // Look in root data folder
  const possiblePaths = [
    path.join(process.cwd(), "..", "..", "data", "canonical", "interview_experiences_v1.3.json"),
    path.join(process.cwd(), "data", "canonical", "interview_experiences_v1.3.json"),
    path.join(__dirname, "..", "..", "..", "..", "data", "canonical", "interview_experiences_v1.3.json"),
  ];

  let filePath = "";
  for (const p of possiblePaths) {
    try {
      await fs.access(p);
      filePath = p;
      break;
    } catch {
      // continue
    }
  }

  if (!filePath) {
    // Default fallback path
    filePath = path.resolve(process.cwd(), "../../data/canonical/interview_experiences_v1.3.json");
  }

  const raw = await fs.readFile(filePath, "utf-8");
  cachedDataset = JSON.parse(raw) as CanonicalDataset;
  return cachedDataset;
}

export async function getAllExperiences(): Promise<Experience[]> {
  const dataset = await getCanonicalDataset();
  return dataset.experiences || [];
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  const experiences = await getAllExperiences();
  return experiences.find((exp) => exp.id === id) || null;
}

export async function getCompanyStats(): Promise<CompanyStats[]> {
  const experiences = await getAllExperiences();
  const companyMap = new Map<string, {
    count: number;
    roles: Set<string>;
    selected: number;
    rounds: number;
    roundSequences: string[][];
    questionsCount: number;
  }>();

  for (const exp of experiences) {
    const cName = exp.company?.name || exp.company?.normalized_name || "Unknown";
    if (!companyMap.has(cName)) {
      companyMap.set(cName, {
        count: 0,
        roles: new Set(),
        selected: 0,
        rounds: 0,
        roundSequences: [],
        questionsCount: 0,
      });
    }
    const stat = companyMap.get(cName)!;
    stat.count += 1;
    if (exp.job?.role) stat.roles.add(exp.job.role);
    if (exp.outcome?.status?.toLowerCase().includes("select") || exp.outcome?.status?.toLowerCase().includes("offer")) {
      stat.selected += 1;
    }
    stat.rounds += (exp.rounds || []).length;
    
    let totalQuestionsInExp = 0;
    const seq = (exp.rounds || []).map((r) => {
      totalQuestionsInExp += (r.questions || []).length;
      return r.name;
    });
    if (seq.length > 0) stat.roundSequences.push(seq);
    stat.questionsCount += totalQuestionsInExp;
  }

  const result: CompanyStats[] = [];
  for (const [name, stat] of companyMap.entries()) {
    // Find most typical round sequence or sample
    const roundSequenceSample = stat.roundSequences.length > 0 ? stat.roundSequences[0] : [];
    result.push({
      name,
      experienceCount: stat.count,
      roles: Array.from(stat.roles),
      selectedCount: stat.selected,
      totalRounds: stat.rounds,
      roundSequenceSample,
      avgQuestionsPerExperience: stat.count > 0 ? Math.round((stat.questionsCount / stat.count) * 10) / 10 : 0,
    });
  }

  // Sort by experience count descending
  return result.sort((a, b) => b.experienceCount - a.experienceCount);
}

export async function getDashboardMetrics() {
  const dataset = await getCanonicalDataset();
  const experiences = dataset.experiences || [];
  const companies = await getCompanyStats();

  let totalRounds = 0;
  let totalQuestions = 0;
  let totalCodingProblems = 0;

  for (const exp of experiences) {
    for (const r of exp.rounds || []) {
      totalRounds += 1;
      totalQuestions += (r.questions || []).length;
      totalCodingProblems += (r.coding?.problems || []).length;
    }
  }

  return {
    totalExperiences: experiences.length,
    totalRounds,
    totalQuestions: totalQuestions || dataset.dataset_metadata?.validation?.total_interview_questions || 493,
    totalCodingProblems: totalCodingProblems || dataset.dataset_metadata?.validation?.total_coding_problems || 173,
    totalCompanies: companies.length,
    topCompanies: companies.slice(0, 8),
  };
}

export async function getQuestionBank() {
  const experiences = await getAllExperiences();
  const questions: Array<
    InterviewQuestion & {
      company: string;
      role: string;
      experienceId: string;
      roundName: string;
    }
  > = [];

  const codingProblems: Array<
    CodingProblem & {
      company: string;
      role: string;
      experienceId: string;
      roundName: string;
    }
  > = [];

  for (const exp of experiences) {
    const companyName = exp.company?.name || "Unknown";
    const roleName = exp.job?.role || "Software Engineer";

    for (const round of exp.rounds || []) {
      for (const rawQ of round.questions || []) {
        const qObj: InterviewQuestion =
          typeof rawQ === "string"
            ? { question: rawQ, topic: "Core CS", difficulty: "medium" }
            : (rawQ as InterviewQuestion);
        if (qObj && qObj.question) {
          questions.push({
            ...qObj,
            company: companyName,
            role: roleName,
            experienceId: exp.id,
            roundName: round.name,
          });
        }
      }

      for (const rawCp of round.coding?.problems || []) {
        const cpObj: CodingProblem =
          typeof rawCp === "string"
            ? { title: (rawCp as string).slice(0, 80), description: rawCp as string, difficulty: "medium" }
            : (rawCp as CodingProblem);
        if (cpObj && cpObj.title) {
          codingProblems.push({
            ...cpObj,
            company: companyName,
            role: roleName,
            experienceId: exp.id,
            roundName: round.name,
          });
        }
      }
    }
  }

  return { questions, codingProblems };
}

export async function getSampleExtraction(name: "walmart" | "phonepe" | "idfc"): Promise<ExtractionResponse | null> {
  const map: Record<string, string> = {
    walmart: "candidate-walmart-extracted.json",
    phonepe: "phonepe-candidate-extracted.json",
    idfc: "candidate-i-idfc-extracted.json",
  };

  const filename = map[name];
  if (!filename) return null;

  const possiblePaths = [
    path.join(process.cwd(), "..", "..", filename),
    path.join(process.cwd(), filename),
    path.resolve(process.cwd(), "../../", filename),
  ];

  for (const p of possiblePaths) {
    try {
      const raw = await fs.readFile(p, "utf-8");
      return JSON.parse(raw) as ExtractionResponse;
    } catch {
      // continue
    }
  }
  return null;
}

export async function ingestExperienceToCanonical(draftExperience: any): Promise<{
  success: boolean;
  assigned_id: string;
  experience_number: number;
  total_experiences: number;
}> {
  const possiblePaths = [
    path.join(process.cwd(), "..", "..", "data", "canonical", "interview_experiences_v1.3.json"),
    path.join(process.cwd(), "data", "canonical", "interview_experiences_v1.3.json"),
    path.resolve(process.cwd(), "../../data/canonical/interview_experiences_v1.3.json"),
  ];

  let filePath = "";
  for (const p of possiblePaths) {
    try {
      await fs.access(p);
      filePath = p;
      break;
    } catch {
      // continue
    }
  }

  if (!filePath) {
    filePath = path.resolve(process.cwd(), "../../data/canonical/interview_experiences_v1.3.json");
  }

  const raw = await fs.readFile(filePath, "utf-8");
  const dataset = JSON.parse(raw) as CanonicalDataset;
  const experiences = dataset.experiences || [];

  // Find highest existing experience number
  let maxNum = 0;
  for (const exp of experiences) {
    if (exp.id && exp.id.startsWith("exp_")) {
      const num = parseInt(exp.id.replace("exp_", ""), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  const nextId = `exp_${String(nextNum).padStart(3, "0")}`;

  const approved = { ...draftExperience };
  approved.id = nextId;
  approved.source = {
    ...(approved.source || {}),
    experience_number: nextNum,
  };

  for (let i = 0; i < (approved.rounds || []).length; i++) {
    approved.rounds[i].sequence = i + 1;
  }

  // Calculate metrics
  const newRounds = (approved.rounds || []).length;
  let newQuestions = 0;
  let newCoding = 0;
  for (const r of approved.rounds || []) {
    newQuestions += (r.questions || []).length;
    newCoding += (r.coding?.problems || []).length;
  }

  experiences.push(approved);
  dataset.experiences = experiences;

  // Update metadata
  const meta = dataset.dataset_metadata || ({} as any);
  meta.total_experiences = experiences.length;
  meta.updated_at = new Date().toISOString();

  if (meta.validation) {
    meta.validation.output_experience_count = experiences.length;
    meta.validation.source_experience_count = (meta.validation.source_experience_count || experiences.length - 1) + 1;
    meta.validation.source_round_count = (meta.validation.source_round_count || 0) + newRounds;
    meta.validation.v1_3_round_count = (meta.validation.v1_3_round_count || 0) + newRounds;
    meta.validation.total_interview_questions = (meta.validation.total_interview_questions || 0) + newQuestions;
    meta.validation.total_coding_problems = (meta.validation.total_coding_problems || 0) + newCoding;
  }

  // Backup file
  const backupPath = `${filePath}.bak`;
  try {
    await fs.copyFile(filePath, backupPath);
  } catch (err) {
    // backup attempt
  }

  // Atomic write via temp file
  const tmpPath = `${filePath}.tmp.${Date.now()}`;
  await fs.writeFile(tmpPath, JSON.stringify(dataset, null, 2) + "\n", "utf-8");
  await fs.rename(tmpPath, filePath);

  // Invalidate cache
  invalidateCache();

  return {
    success: true,
    assigned_id: nextId,
    experience_number: nextNum,
    total_experiences: experiences.length,
  };
}

/* ------------------------------------------------------------------ */
/*  Analytics Aggregation                                              */
/* ------------------------------------------------------------------ */

export interface AnalyticsData {
  totals: {
    experiences: number;
    rounds: number;
    questions: number;
    codingProblems: number;
    companies: number;
    tips: number;
  };
  companyBreakdown: { name: string; count: number; selected: number; rejected: number }[];
  roundTypes: { type: string; label: string; count: number; pct: number }[];
  outcomes: { status: string; count: number; pct: number }[];
  questionTopics: { topic: string; count: number }[];
  difficulty: { level: string; count: number; pct: number }[];
  employmentTypes: { type: string; label: string; count: number; pct: number }[];
  seasonality: { month: string; count: number }[];
}

const ROUND_TYPE_LABELS: Record<string, string> = {
  technical_interview: "Technical Interview",
  online_assessment: "Online Assessment",
  hr_interview: "HR Interview",
  coding_test: "Coding Test",
  managerial_interview: "Managerial Interview",
  hackathon: "Hackathon",
  mcq: "MCQ",
  group_discussion: "Group Discussion",
  combined_interview: "Combined Interview",
  aptitude: "Aptitude",
  technical_test: "Technical Test",
  behavioral_interview: "Behavioral Interview",
  ppt: "PPT",
  case_study: "Case Study",
  system_design: "System Design",
  resume_screening: "Resume Screening",
  prompt_engineering: "Prompt Engineering",
  other: "Other",
};

const EMP_TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  fte: "Full Time",
  internship: "Internship",
  internship_and_full_time: "Internship + FTE",
  internship_plus_fte: "Internship + FTE",
  unknown: "Unknown",
};

const MONTH_ORDER = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const experiences = await getAllExperiences();

  let totalRounds = 0;
  let totalQuestions = 0;
  let totalCodingProblems = 0;
  let totalTips = 0;

  const companyMap = new Map<string, { count: number; selected: number; rejected: number }>();
  const roundTypeMap = new Map<string, number>();
  const outcomeMap = new Map<string, number>();
  const topicMap = new Map<string, number>();
  const diffMap = new Map<string, number>();
  const empMap = new Map<string, number>();
  const monthMap = new Map<string, number>();

  for (const exp of experiences) {
    // Company
    const cName = exp.company?.name || exp.company?.normalized_name || "Unknown";
    if (!companyMap.has(cName)) companyMap.set(cName, { count: 0, selected: 0, rejected: 0 });
    const cs = companyMap.get(cName)!;
    cs.count++;
    const status = (exp.outcome?.status || "unknown").toLowerCase();
    if (status.includes("select") || status.includes("offer")) cs.selected++;
    if (status.includes("reject")) cs.rejected++;

    // Outcome
    const oKey = status.includes("select") || status.includes("offer") ? "selected" : status.includes("reject") ? "rejected" : "other";
    outcomeMap.set(oKey, (outcomeMap.get(oKey) || 0) + 1);

    // Employment type
    const empRaw = (exp.job?.employment_type || "unknown").toLowerCase();
    empMap.set(empRaw, (empMap.get(empRaw) || 0) + 1);

    // Seasonality
    const month = exp.timeline?.month || null;
    if (month) monthMap.set(month, (monthMap.get(month) || 0) + 1);

    // Tips
    totalTips += (exp.tips || []).length;

    // Rounds
    for (const r of exp.rounds || []) {
      totalRounds++;
      const rType = (r.type || "unknown").toLowerCase();
      roundTypeMap.set(rType, (roundTypeMap.get(rType) || 0) + 1);

      // Difficulty
      const diff = (r.difficulty || "unspecified").toLowerCase();
      diffMap.set(diff, (diffMap.get(diff) || 0) + 1);

      // Questions
      for (const q of r.questions || []) {
        totalQuestions++;
        const topic = q.topic || q.category || "Untagged";
        topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
      }

      // Coding
      totalCodingProblems += (r.coding?.problems || []).length;
    }
  }

  // Build sorted arrays
  const companyBreakdown = Array.from(companyMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count);

  const roundTypes = Array.from(roundTypeMap.entries())
    .map(([type, count]) => ({ type, label: ROUND_TYPE_LABELS[type] || type, count, pct: Math.round((count / totalRounds) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);

  const totalExp = experiences.length;
  const outcomes = Array.from(outcomeMap.entries())
    .map(([status, count]) => ({ status, count, pct: Math.round((count / totalExp) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);

  const questionTopics = Array.from(topicMap.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  // Filter out 'unspecified' from difficulty for the chart, keep only meaningful ones
  const diffEntries = Array.from(diffMap.entries()).filter(([k]) => k !== "unspecified" && k !== "null");
  const diffTotal = diffEntries.reduce((s, [, c]) => s + c, 0);
  const difficulty = diffEntries
    .map(([level, count]) => ({ level, count, pct: diffTotal > 0 ? Math.round((count / diffTotal) * 1000) / 10 : 0 }))
    .sort((a, b) => b.count - a.count);

  const empTotal = experiences.length;
  const employmentTypes = Array.from(empMap.entries())
    .map(([type, count]) => ({ type, label: EMP_TYPE_LABELS[type] || type, count, pct: Math.round((count / empTotal) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);

  const seasonality = MONTH_ORDER.map((m) => ({ month: m.slice(0, 3), count: monthMap.get(m) || 0 }));

  const uniqueCompanies = companyMap.size;

  return {
    totals: {
      experiences: totalExp,
      rounds: totalRounds,
      questions: totalQuestions,
      codingProblems: totalCodingProblems,
      companies: uniqueCompanies,
      tips: totalTips,
    },
    companyBreakdown,
    roundTypes,
    outcomes,
    questionTopics,
    difficulty,
    employmentTypes,
    seasonality,
  };
}

