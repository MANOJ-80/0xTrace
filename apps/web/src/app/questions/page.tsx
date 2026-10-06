import { getQuestionBank, getCompanyStats } from "@/lib/data";
import QuestionBankClient from "./QuestionBankClient";

export const metadata = {
  title: "Question & Coding Problem Bank — 0xTrace",
  description: "Browse 493+ real interview questions and 173+ coding problems asked in campus placement drives.",
};

export default async function QuestionsPage() {
  const { questions, codingProblems } = await getQuestionBank();
  const companies = await getCompanyStats();

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-ox-ink">
          Question & coding problem bank
        </h1>
        <p className="text-sm text-ox-muted">
          Real interview questions and coding challenges extracted verbatim from campus placement drives.
        </p>
      </div>

      <QuestionBankClient
        questions={questions}
        codingProblems={codingProblems}
        companies={companies.map((c) => c.name).sort((a, b) => a.localeCompare(b))}
      />
    </div>
  );
}
