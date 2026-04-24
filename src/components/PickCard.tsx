import { MemoCard, Memo, formatCategory } from "@/components/ui/memo-card";

export type { Memo };
export { formatCategory };

export default function PickCard({ memo, basePath }: { memo: Memo; basePath?: string }) {
  return <MemoCard memo={memo} variant="light" gridItem basePath={basePath} />;
}
