import { COL, RECT_W } from "./config";

interface IndicatorProps {
  visible: boolean;
}

export function Indicator({ visible }: IndicatorProps) {
  const trackCenter = COL / 2;

  return (
    <div
      className="absolute bg-accent transition-[height] duration-75 ease-out motion-reduce:transition-none"
      style={{
        left: `${trackCenter - (RECT_W - 2) / 2}px`,
        width: RECT_W,
        top: 0,
        height: "calc(var(--progress-height, 0px) + 10px)",
        opacity: visible ? 1 : 0,
        zIndex: 0,
      }}
    />
  );
}
