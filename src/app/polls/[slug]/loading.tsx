import { MemoSkeleton } from "@/app/memos/[slug]/MemoSkeleton";

export default function Loading() {
  return <MemoSkeleton contentLabel="poll" showBackLink />;
}
