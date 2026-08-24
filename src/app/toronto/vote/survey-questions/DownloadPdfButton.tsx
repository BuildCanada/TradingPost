"use client";

import { Download } from "lucide-react";

export function DownloadPdfButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ??
        "no-print group/btn inline-flex items-center gap-3 type-button text-bg bg-accent px-7 py-4 transition-colors hover:bg-auburn-700 cursor-pointer"
      }
    >
      Download PDF
      <Download
        className="size-4 shrink-0 transition-transform group-hover/btn:translate-y-0.5"
        strokeWidth={2}
      />
    </button>
  );
}
