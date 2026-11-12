"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitMerge } from "lucide-react";

interface MergeIntoButtonProps {
  targetId: string;
  targetLabel: string;
  sourceIds: string[];
}

export default function MergeIntoButton({
  targetId,
  targetLabel,
  sourceIds,
}: MergeIntoButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const merge = async () => {
    const count = sourceIds.length;
    if (
      !window.confirm(
        `Merge ${count} other record${count === 1 ? "" : "s"} into ${targetLabel}? Empty fields will be filled from the other records, then those records will be deleted. This cannot be undone.`
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/duplicates/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, sourceIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Merge failed");
      router.refresh();
    } catch (error: any) {
      window.alert(`Merge failed: ${error.message}`);
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={merge}
      disabled={busy}
      className="admin-icon-action"
      title={`Merge the other ${sourceIds.length} record${
        sourceIds.length === 1 ? "" : "s"
      } into this one`}
      aria-label={`Merge other records into ${targetLabel}`}
    >
      <GitMerge className="h-4 w-4" />
    </button>
  );
}
