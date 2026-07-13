import type { EconomySeriesPoint } from "@/lib/api/economy";

export type OverlayMode = "indexed" | "raw";

export type OverlaySeries = {
  label: string;
  color: string;
  unitSymbol: string;
  points: EconomySeriesPoint[];
};
