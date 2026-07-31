"use client";

import { useEffect, useState } from "react";
import { daysUntil, ELECTION_DATE_ISO } from "./data";

const DEFAULT_CLASS =
  "font-sans font-semibold leading-[0.8] tracking-[-0.05em] text-[clamp(6rem,20vw,15rem)] tabular-nums";

/**
 * Renders a "days until <date>" number, defaulting to election day. The
 * server passes an initialDays computed at request time so first paint
 * matches hydration; the client then keeps it current across day
 * boundaries. `className` overrides the default hero-sized styling (e.g.
 * for the ward stat row or the smaller advance/mail-in counters).
 */
export default function CountdownDays({
  initialDays,
  targetIso = ELECTION_DATE_ISO,
  className,
}: {
  initialDays: number;
  targetIso?: string;
  className?: string;
}) {
  const [days, setDays] = useState(initialDays);

  useEffect(() => {
    const tick = () => setDays(daysUntil(targetIso));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [targetIso]);

  return <span className={className ?? DEFAULT_CLASS}>{days}</span>;
}
