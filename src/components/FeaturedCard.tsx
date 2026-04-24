import { MemoCard, Memo } from "@/components/ui/memo-card";

export type { Memo };

export default function FeaturedCard({
  memo,
  label,
  priority = false,
  wide = false,
  basePath,
}: {
  memo: Memo;
  label: string;
  priority?: boolean;
  wide?: boolean;
  basePath?: string;
}) {
  return <MemoCard memo={memo} variant={wide ? "featured" : "dark"} showLabel={label} priority={priority} basePath={basePath} />;
}
