export type OverlayMode = "indexed" | "raw";

export type OverlaySeries = {
  label: string;
  color: string;
  unitSymbol: string;
  points: { year: number; value: number }[];
};
