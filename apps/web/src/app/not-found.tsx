import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-ox-edge bg-ox-surface-raised">
        <FileQuestion className="h-6 w-6 text-ox-muted" />
      </div>
      <p className="page-kicker">404</p>
      <h1 className="page-title mt-2">This page does not exist.</h1>
      <p className="page-description mx-auto mt-3 max-w-md text-center">
        The link may be old, or the record may have been removed. The archive is still available.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/experiences" className="ui-action-primary">
          Browse experiences
        </Link>
        <Link href="/" className="ui-action-secondary">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
      </div>
    </div>
  );
}
