import { MemoCard, Memo } from "@/components/ui/memo-card";

export type { Memo };

export default function FeaturedCard({
  memo,
  label,
  priority = false,
}: {
  memo: Memo;
  label: string;
  priority?: boolean;
}) {
  return <MemoCard memo={memo} variant="dark" showLabel={label} priority={priority} />;
}
