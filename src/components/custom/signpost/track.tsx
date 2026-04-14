import { COL } from "./config";

export function Track() {
  return (
    <div
      className="absolute bottom-2 top-0 w-[2px] bg-border-light"
      style={{ left: `${COL / 2}px` }}
    />
  );
}
