/**
 * Canonical labels and cleanup for extracted question metadata.
 *
 * Models drift: they echo a prompt's example list as a literal topic, write
 * "null" as a string, or leave a field empty. Topic inference here is
 * deterministic, so obvious questions (AWS, React, JWT, DNS) get a stable label
 * even when the model returns nothing useful.
 */

export const QUESTION_TOPICS = [
  "Operating Systems",
  "DBMS & SQL",
  "Data Structures & Algorithms",
  "Object Oriented Programming",
  "Computer Networks",
  "Cloud Computing",
  "DevOps & Containers",
  "Frontend & React",
  "Backend & APIs",
  "Security & Authentication",
  "System Design",
  "Java",
  "Python",
  "JavaScript",
  "C/C++",
  "Machine Learning",
  "Projects & Experience",
  "Aptitude & Puzzles",
  "HR & Behavioral",
] as const;

export type QuestionTopic = (typeof QUESTION_TOPICS)[number];
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionCategory = "technical" | "behavioral" | "hr";

const TOPIC_ALIASES: Record<string, QuestionTopic> = {
  os: "Operating Systems",
  "operating system": "Operating Systems",
  "operating systems": "Operating Systems",

  dbms: "DBMS & SQL",
  sql: "DBMS & SQL",
  database: "DBMS & SQL",
  databases: "DBMS & SQL",
  rdbms: "DBMS & SQL",
  nosql: "DBMS & SQL",
  "dbms and sql": "DBMS & SQL",
  "dbms and nosql": "DBMS & SQL",

  dsa: "Data Structures & Algorithms",
  "data structures": "Data Structures & Algorithms",
  algorithms: "Data Structures & Algorithms",
  "data structures and algorithms": "Data Structures & Algorithms",
  coding: "Data Structures & Algorithms",

  oops: "Object Oriented Programming",
  oop: "Object Oriented Programming",
  "object oriented programming": "Object Oriented Programming",

  cn: "Computer Networks",
  networking: "Computer Networks",
  network: "Computer Networks",
  "computer networks": "Computer Networks",
  dns: "Computer Networks",

  cloud: "Cloud Computing",
  aws: "Cloud Computing",
  "amazon web services": "Cloud Computing",
  azure: "Cloud Computing",
  gcp: "Cloud Computing",
  "cloud computing": "Cloud Computing",

  devops: "DevOps & Containers",
  docker: "DevOps & Containers",
  containers: "DevOps & Containers",
  kubernetes: "DevOps & Containers",
  deployment: "DevOps & Containers",

  react: "Frontend & React",
  "react js": "Frontend & React",
  frontend: "Frontend & React",
  "front end": "Frontend & React",
  "frontend and react": "Frontend & React",
  dom: "Frontend & React",

  node: "Backend & APIs",
  "node js": "Backend & APIs",
  backend: "Backend & APIs",
  "back end": "Backend & APIs",
  api: "Backend & APIs",
  apis: "Backend & APIs",
  "web development": "Backend & APIs",

  security: "Security & Authentication",
  authentication: "Security & Authentication",
  authorization: "Security & Authentication",
  jwt: "Security & Authentication",
  cybersecurity: "Security & Authentication",

  "system design": "System Design",
  hld: "System Design",
  lld: "System Design",
  architecture: "System Design",

  hr: "HR & Behavioral",
  behavioral: "HR & Behavioral",
  behavioural: "HR & Behavioral",
  "hr and behavioral": "HR & Behavioral",

  projects: "Projects & Experience",
  project: "Projects & Experience",
  internship: "Projects & Experience",
  resume: "Projects & Experience",

  aptitude: "Aptitude & Puzzles",
  puzzles: "Aptitude & Puzzles",
  "logical reasoning": "Aptitude & Puzzles",

  "machine learning": "Machine Learning",
  ml: "Machine Learning",
  ai: "Machine Learning",

  java: "Java",
  python: "Python",
  javascript: "JavaScript",
  js: "JavaScript",
  c: "C/C++",
  "c plus plus": "C/C++",
  "c++": "C/C++",
  "c/c++": "C/C++",
};

const TOPIC_BY_KEY = new Map<string, QuestionTopic>(
  QUESTION_TOPICS.map((topic) => [topic.toLowerCase(), topic])
);

const GENERIC_TOPICS = new Set([
  "null",
  "none",
  "n a",
  "na",
  "nan",
  "undefined",
  "unknown",
  "other",
  "general",
  "misc",
  "technical",
  "core cs",
  "core computer science",
  "computer science",
  "cs fundamentals",
  "programming",
  "software engineering",
]);

function labelKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Rules are ordered from most specific to most general. */
const TOPIC_RULES: Array<[RegExp, QuestionTopic]> = [
  [/\bjavascript\b|\btypescript\b|(?<![\w.])js\b/i, "JavaScript"],
  [/\bjava\b(?!\s*script)/i, "Java"],
  [/\bpython\b/i, "Python"],
  [/\bc\+\+\b|\bc#\b|\bpointers?\b|\bmemory allocation\b/i, "C/C++"],

  [
    /\baws\b|\bs3\b|\bec2\b|\bazure\b|\bgcp\b|\bcloud\b|\biam\b/i,
    "Cloud Computing",
  ],
  [
    /\bdocker\b|\bkubernetes\b|\bcontainer(?:s|ize|ized|izing|isation|ization)?\b|\bdeploy(?:ment)?\b|\bci\s*\/?\s*cd\b|\bdevops\b/i,
    "DevOps & Containers",
  ],
  [/\breact\b|\bhooks?\b|\bvirtual dom\b|\bdom\b/i, "Frontend & React"],
  [
    /\bjwt\b|\boauth\b|\bauthenticat|\bauthoriz|\bpasswords?\b|\bpii\b|\bencrypt|\bcookies?\b|\bcsrf\b|\bxss\b|\bapi keys?\b|\bsecrets?\b|\bsignatures?\b|\btamper\w*\b|\bnot (?:been )?modified\b|\bstolen\b/i,
    "Security & Authentication",
  ],
  [
    /\bnode(?:\.?js)?\b|\bexpress\b|\bbackend\b|\brest(?:ful)? api\b|\bapi\b|\bapis\b/i,
    "Backend & APIs",
  ],
  [
    /\bsystem design\b|\bdesign (?:a |an )?(?:whatsapp|chat|url|system|service|application)|\bscalab|\barchitecture\b|\bload balancer|\bsharding|\bcach(?:e|ing)\b|\bmessage queue|\bkafka\b|\btraffic\b|\bbooking\b/i,
    "System Design",
  ],
  [
    /\bsql\b|\bnosql\b|\bdbms\b|\bdatabase|\bindex(?:es)?\b|\bquer(?:y|ies)\b|\bpostgres|\bmysql\b|\bmongo|\bnormaliz/i,
    "DBMS & SQL",
  ],
  [
    /\bdns\b|\bhttp\b|\btcp\b|\budp\b|\bip(?:\s+address|\s+mappings?)?\b|\bnetwork|\bbrowser\b|\bcdn\b/i,
    "Computer Networks",
  ],
  [
    /\bthreads?\b|\bprocess(?:es)?\b|\boperating system|\bdeadlock|\bvirtual memory|\bscheduling\b|\bconcurren(?:cy|t)\b|\bparallelism\b/i,
    "Operating Systems",
  ],
  [
    /\barrays?\b|\blinked list|\btrees?\b|\bgraphs?\b|\bheap\b|(?<!tech )(?<!full )\bstack\b|\bqueue\b|\balgorithms?\b|\bdynamic programming\b|\bcomplexity\b|\bsorting\b|\bsearching\b/i,
    "Data Structures & Algorithms",
  ],
  [
    /\bpuzzles?\b|\baptitude\b|\bprobability\b|\bpermutation|\breasoning\b|\bbuckets?\b|\bhorses?\b|\btorch\b/i,
    "Aptitude & Puzzles",
  ],
  [
    /\bhr\b|\bbehavio|\bteamwork\b|\bconflict|\bstrengths?\b|\bweakness|\bjourney\b|\bmemorable\b|\btell me about yourself\b|\b(?:high|low) points\b|\bquestions for us\b|\brelocat|\bcareer goal/i,
    "HR & Behavioral",
  ],
  [/\bprojects?\b|\binternships?\b|\bresume\b/i, "Projects & Experience"],
  [
    /\bmachine learning\b|\bml\b|\bai\b|\bllms?\b|\bneural\b|\brag\b/i,
    "Machine Learning",
  ],
  [
    /\boops\b|\bobject[- ]oriented\b|\binheritance\b|\bpolymorphism\b|\bencapsulation\b/i,
    "Object Oriented Programming",
  ],
];

function cleanLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const text = value
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();

  if (!text || text.length > 80) return null;
  if (text.includes("|")) return null;

  const key = labelKey(text);
  if (!key || GENERIC_TOPICS.has(key)) return null;

  return text;
}

export function inferQuestionTopic(question: string): QuestionTopic | null {
  for (const [pattern, topic] of TOPIC_RULES) {
    if (pattern.test(question)) return topic;
  }
  return null;
}

export function normalizeQuestionTopic(
  value: unknown,
  question: string
): QuestionTopic | null {
  // Keyword inference first: it is stable and catches model labels that were
  // forced into the wrong bucket by a narrow prompt.
  const inferred = inferQuestionTopic(question);
  if (inferred) return inferred;

  const label = cleanLabel(value);
  if (!label) return null;

  const key = labelKey(label);
  return TOPIC_BY_KEY.get(key) || TOPIC_ALIASES[key] || null;
}

export function normalizeQuestionDifficulty(
  value: unknown
): QuestionDifficulty | null {
  if (typeof value !== "string") return null;

  const key = value.trim().toLowerCase();
  if (!key) return null;
  if (key.includes("easy")) return "easy";
  if (key.includes("hard") || key.includes("difficult")) return "hard";
  if (key.includes("medium") || key.includes("moderate")) return "medium";
  return null;
}

export function normalizeQuestionCategory(
  value: unknown,
  topic: QuestionTopic | null
): QuestionCategory | null {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  const modelCategory =
    raw === "technical" || raw === "behavioral" || raw === "hr" ? raw : null;

  if (topic === "HR & Behavioral") {
    return modelCategory === "hr" || modelCategory === "behavioral"
      ? modelCategory
      : "behavioral";
  }

  if (topic) return "technical";
  return modelCategory;
}

/**
 * Return the question with every model-provided metadata field validated.
 * Unknown values become null instead of leaking words like "null" or a
 * pipe-joined list into the archive.
 */
export function normalizeQuestion<T extends Record<string, any>>(input: T): T {
  const question =
    typeof input.question === "string" ? input.question.trim() : "";
  const topic = normalizeQuestionTopic(input.topic, question);

  return {
    ...input,
    question,
    topic,
    difficulty: normalizeQuestionDifficulty(input.difficulty),
    category: normalizeQuestionCategory(input.category, topic),
  };
}
