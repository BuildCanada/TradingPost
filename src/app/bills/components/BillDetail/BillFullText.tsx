import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { UnifiedBill } from "@/app/bills/utils/billConverters";

interface BillFullTextProps {
  bill: UnifiedBill;
}

export function BillFullText({ bill }: BillFullTextProps) {
  if (!bill.fullTextMarkdown) return null;

  return (
    <article className="border border-border-light bg-white p-5">
      <h2 className="font-semibold mb-2 text-dark">Full Text</h2>
      <div className="text-sm leading-6 text-text-secondary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {bill.fullTextMarkdown}
        </ReactMarkdown>
      </div>
    </article>
  );
}
