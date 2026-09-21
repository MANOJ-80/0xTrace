import { getQuestionBank, getCompanyStats } from "@/lib/data";
import QuestionBankClient from "./QuestionBankClient";

export const metadata = {
  title: "Placement Question & Problem Bank — 0xTrace",
  description: "Browse 493+ real interview questions and 173+ coding problems asked in top tech company placement drives.",
};

export default async function QuestionsPage() {
  const { questions, codingProblems } = await getQuestionBank();
  const companies = await getCompanyStats();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Placement Question & Coding Problem Bank
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Search real interview questions and coding challenges extracted verbatim from campus placement drives. Every problem is linked directly to the candidate's full experience trace.
        </p>
      </div>

      <QuestionBankClient
        questions={questions}
        codingProblems={codingProblems}
        companies={companies.map((c) => c.name)}
      />
    </div>
  );
}
