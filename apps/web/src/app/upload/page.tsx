import ExtractionStudio from "@/components/ExtractionStudio";
import { FileUp } from "lucide-react";

export const metadata = {
  title: "Upload PDF — 0xTrace",
  description:
    "Upload a campus interview PDF, review the extracted rounds and questions, then publish it.",
};

export default function UploadPage() {
  return (
    <div className="space-y-7">
      <header className="page-heading">
        <div className="page-heading-copy">
          <div className="page-kicker">PDF ingestion</div>
          <h1 className="page-title">Turn a PDF into a published experience</h1>
          <p className="page-description">
            Upload the document, check the extracted company, rounds, and questions, then
            confirm. Drafts are never published automatically.
          </p>
        </div>
        <div className="page-heading-icon">
          <FileUp className="w-5 h-5 text-ox-accent" />
        </div>
      </header>

      <ExtractionStudio />
    </div>
  );
}
