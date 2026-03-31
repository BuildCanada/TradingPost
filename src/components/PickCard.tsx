import { MemoCard, Memo, formatCategory } from "@/components/ui/memo-card";

export type { Memo };
export { formatCategory };

export default function PickCard({ memo, isLatest }: { memo: Memo; isLatest?: boolean }) {
  return <MemoCard memo={memo} variant="light" isLatest={isLatest} gridItem />;
}
