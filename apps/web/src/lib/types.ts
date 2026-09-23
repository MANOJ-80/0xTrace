export interface Candidate {
  name?: string | null;
  department?: string | null;
  degree?: string | null;
  college?: string | null;
  cgpa?: number | string | null;
  roll_no?: string | null;
}

export interface Company {
  name?: string | null;
  normalized_name?: string | null;
}

export interface Job {
  role?: string | null;
  employment_type?: string | null;
  location?: string | null;
}

export interface Timeline {
  month?: string | null;
  year?: number | null;
  drive_type?: string | null;
}

export interface Eligibility {
  min_cgpa?: number | null;
  branches_eligible?: string[] | null;
  history_of_arrears?: boolean | null;
  standing_arrears?: boolean | null;
}

export interface Compensation {
  ctc?: string | number | null;
  base?: string | number | null;
  stipend?: string | number | null;
  breakdown?: string | null;
}

export interface InterviewQuestion {
  question: string;
  topic?: string | null;
  subtopic?: string | null;
  difficulty?: string | null;
  category?: string | null;
  details?: string | null;
}

export interface CodingProblem {
  title: string;
  description?: string | null;
  difficulty?: string | null;
  platform?: string | null;
  language?: string | null;
  topics?: string[];
}

export interface RoundCoding {
  problem_count?: number;
  problems?: CodingProblem[];
}

export interface Round {
  sequence: number;
  name: string;
  original_name?: string;
  type: string;
  date?: string | null;
  time?: string | null;
  mode?: string | null;
  platform?: string | null;
  venue?: string | null;
  duration?: string | null;
  difficulty?: string | null;
  description?: string | null;
  raw_content: string | null;
  questions?: InterviewQuestion[];
  coding?: RoundCoding;
}

export interface Outcome {
  status?: string | null;
  offer_type?: string | null;
  candidates_selected?: number | null;
  candidates_appeared?: number | null;
}

export interface Contacts {
  email?: string | null;
  linkedin?: string | null;
  phone?: string | null;
}

export interface Quality {
  score?: number;
  issues?: string[];
}

export interface Experience {
  id: string;
  source: {
    experience_number?: number;
    file_name?: string;
    page_count?: number;
    [key: string]: any;
  };
  candidate: Candidate;
  company: Company;
  job: Job;
  timeline: Timeline;
  eligibility: Eligibility;
  compensation: Compensation;
  pre_placement?: any[];
  rounds: Round[];
  outcome: Outcome;
  tips: string[];
  mistakes?: string[];
  conclusion?: string | null;
  contacts: Contacts;
  additional_information: string[];
  quality: Quality;
  raw_text: string;
}

export interface UiDocumentSection {
  type: "metadata" | "round" | "outcome" | "tips" | "conclusion" | "contacts" | "additional_information" | string;
  title: string;
  raw_content: string;
}

export interface UiDocument {
  version: string;
  source: {
    filename?: string;
    page_count?: number;
    character_count?: number;
    sha256?: string;
  };
  sections: UiDocumentSection[];
  integrity: {
    lossless: boolean;
    source_span_count?: number;
    assigned_source_span_count?: number;
    recovery_notices?: string[];
  };
}

export interface CanonicalDataset {
  dataset_metadata: {
    title?: string;
    version?: string;
    description?: string;
    created_at?: string;
    validation?: {
      source_experience_count?: number;
      output_experience_count?: number;
      source_round_count?: number;
      total_interview_questions?: number;
      total_coding_problems?: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
  experiences: Experience[];
}

export interface ExtractionResponse {
  dataset_metadata?: any;
  experiences: Experience[];
  ui_document: UiDocument;
}

export interface CompanyStats {
  name: string;
  experienceCount: number;
  roles: string[];
  selectedCount: number;
  totalRounds: number;
  roundSequenceSample: string[];
  avgQuestionsPerExperience: number;
}
