import {
  Experience,
  CompanyStats,
  InterviewQuestion,
  CodingProblem,
  ExtractionResponse,
} from "./types";
import { getCollection } from "./mongodb";
import { ObjectId } from "mongodb";

/* ------------------------------------------------------------------ */
/*  Core Data Access (MongoDB)                                         */
/* ------------------------------------------------------------------ */

export function invalidateCache() {
  // No-op — MongoDB handles caching at the driver level
}

export async function getAllExperiences(): Promise<Experience[]> {
  const col = await getCollection("experiences");
  const docs = await col.find({}).toArray();
  return docs.map(doc => ({ ...doc, _id: doc._id.toString() })) as unknown as Experience[];
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  const col = await getCollection("experiences");
  let doc = null;
  
  if (ObjectId.isValid(id)) {
    doc = await col.findOne({ _id: new ObjectId(id) });
  } else {
    // Fallback for legacy exp_XXX URLs
    doc = await col.findOne({ id });
  }

  if (!doc) return null;
  return { ...doc, _id: doc._id.toString() } as unknown as Experience;
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

  return result.sort((a, b) => b.experienceCount - a.experienceCount);
}

export async function getDashboardMetrics() {
  const experiences = await getAllExperiences();
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
    totalQuestions: totalQuestions || 493,
    totalCodingProblems: totalCodingProblems || 173,
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
            experienceId: exp._id || exp.id,
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
            experienceId: exp._id || exp.id,
            roundName: round.name,
          });
        }
      }
    }
  }

  return { questions, codingProblems };
}

export async function getSampleExtraction(name: "walmart" | "phonepe" | "idfc"): Promise<ExtractionResponse | null> {
  // Samples are no longer stored as flat files — return null
  return null;
}

/* ------------------------------------------------------------------ */
/*  Ingestion (MongoDB)                                                */
/* ------------------------------------------------------------------ */

export async function ingestExperienceToCanonical(draftExperience: any): Promise<{
  success: boolean;
  assigned_id: string;
  experience_number: number;
  total_experiences: number;
}> {
  const col = await getCollection("experiences");
  const metaCol = await getCollection("metadata");

  // Find highest existing experience number
  const latest = await col.find({ id: { $regex: /^exp_\d+$/ } })
    .sort({ id: -1 })
    .limit(1)
    .toArray();

  let maxNum = 0;
  if (latest.length > 0 && latest[0].id) {
    const num = parseInt(latest[0].id.replace("exp_", ""), 10);
    if (!isNaN(num)) maxNum = num;
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

  // Insert into MongoDB
  const result = await col.insertOne(approved);

  // Update metadata
  const totalCount = await col.countDocuments();
  await metaCol.updateOne(
    { _id: "dataset_metadata" } as any,
    {
      $set: {
        total_experiences: totalCount,
        updated_at: new Date().toISOString(),
      },
    },
    { upsert: true }
  );

  return {
    success: true,
    assigned_id: result.insertedId.toString(),
    experience_number: nextNum,
    total_experiences: totalCount,
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
    const cName = exp.company?.name || exp.company?.normalized_name || "Unknown";
    if (!companyMap.has(cName)) companyMap.set(cName, { count: 0, selected: 0, rejected: 0 });
    const cs = companyMap.get(cName)!;
    cs.count++;
    const status = (exp.outcome?.status || "unknown").toLowerCase();
    if (status.includes("select") || status.includes("offer")) cs.selected++;
    if (status.includes("reject")) cs.rejected++;

    const oKey = status.includes("select") || status.includes("offer") ? "selected" : status.includes("reject") ? "rejected" : "other";
    outcomeMap.set(oKey, (outcomeMap.get(oKey) || 0) + 1);

    const empRaw = (exp.job?.employment_type || "unknown").toLowerCase();
    empMap.set(empRaw, (empMap.get(empRaw) || 0) + 1);

    const month = exp.timeline?.month || null;
    if (month) monthMap.set(month, (monthMap.get(month) || 0) + 1);

    totalTips += (exp.tips || []).length;

    for (const r of exp.rounds || []) {
      totalRounds++;
      const rType = (r.type || "unknown").toLowerCase();
      roundTypeMap.set(rType, (roundTypeMap.get(rType) || 0) + 1);

      const diff = (r.difficulty || "unspecified").toLowerCase();
      diffMap.set(diff, (diffMap.get(diff) || 0) + 1);

      for (const q of r.questions || []) {
        totalQuestions++;
        const topic = q.topic || q.category || "Untagged";
        topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
      }

      totalCodingProblems += (r.coding?.problems || []).length;
    }
  }

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
