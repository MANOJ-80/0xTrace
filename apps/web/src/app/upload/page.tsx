import { getSampleExtraction } from "@/lib/data";
import ExtractionStudio from "@/components/ExtractionStudio";

export const metadata = {
  title: "PDF Extraction Studio — 0xTrace",
  description:
    "Lossless evidence-first extraction studio for college interview experience PDFs.",
};

export default async function UploadPage() {
  const initialSample = await getSampleExtraction("walmart");

  return (
    <div className="space-y-6">
      <ExtractionStudio initialSample={initialSample} />
    </div>
  );
}
