import { MemoSkeleton } from "./MemoSkeleton";

// This route reads cookies (draft preview + viewer state), so it renders
// dynamically on every request and its prefetch payload is empty. Without a
// loading boundary a click leaves the previous page on screen for the whole
// round trip, which reads as a dead click.
export default function Loading() {
  return <MemoSkeleton />;
}
