import { MemoCard, Memo, formatCategory } from "@/components/ui/memo-card";

export type { Memo };
export { formatCategory };

export default function PickCard({ memo }: { memo: Memo }) {
  return <MemoCard memo={memo} variant="light" gridItem />;
}
