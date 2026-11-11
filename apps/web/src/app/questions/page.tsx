import { getQuestionBank, getCompanyStats } from "@/lib/data";
import QuestionBankClient from "./QuestionBankClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Question & Coding Problem Bank",
  description:
    "Search interview questions and coding problems from campus placement experiences by topic, difficulty, and company.",
  openGraph: {
    title: "Question & Coding Problem Bank | 0xTrace",
    description:
      "Search interview questions and coding problems from campus placement experiences by topic, difficulty, and company.",
    siteName: "0xTrace",
  },
  twitter: {
    card: "summary_large_image",
    title: "Question & Coding Problem Bank | 0xTrace",
    description:
      "Search interview questions and coding problems from campus placement experiences by topic, difficulty, and company.",
  },
};

export default async function QuestionsPage() {
  const { questions, codingProblems } = await getQuestionBank();
  const companies = await getCompanyStats();

  return (
    <div className="space-y-5">
      <header className="page-heading">
        <div className="page-heading-copy">
          <div className="page-kicker">Practice library</div>
          <h1 className="page-title">Questions from real interview rounds</h1>
          <p className="page-description">
            Search technical questions and coding problems from campus placement experiences by topic, difficulty, or company.
          </p>
        </div>
      </header>

      <QuestionBankClient
        questions={questions}
        codingProblems={codingProblems}
        companies={companies.map((c) => c.name).sort((a, b) => a.localeCompare(b))}
      />
    </div>
  );
}
