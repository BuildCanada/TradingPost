"use client";

import { useEffect, useState } from "react";
import { daysUntilElection } from "./data";

const DEFAULT_CLASS =
  "font-sans font-semibold leading-[0.8] tracking-[-0.05em] text-[clamp(6rem,20vw,15rem)] tabular-nums";

/**
 * Renders the "days until polls open" number. The server passes an
 * initialDays computed at request time so first paint matches hydration;
 * the client then keeps it current across day boundaries. `className`
 * overrides the default hero-sized styling (e.g. for the ward stat row).
 */
export default function CountdownDays({
  initialDays,
  className,
}: {
  initialDays: number;
  className?: string;
}) {
  const [days, setDays] = useState(initialDays);

  useEffect(() => {
    const tick = () => setDays(daysUntilElection());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return <span className={className ?? DEFAULT_CLASS}>{days}</span>;
}
