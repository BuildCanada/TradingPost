"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getVotingSteps, type VotingStep } from "../voter-guide";

/**
 * The five steps, rendered from the server's reading of the calendar and then
 * corrected to the reader's own clock on mount.
 *
 * The steps are phase-dependent — step three stops offering the mail-in
 * application once applications close, step two stops offering online
 * registration once that closes — and the page is ISR-cached hourly. Those two
 * facts together meant a cached copy could keep offering an application path
 * that had already closed for up to an hour after the deadline, and two of the
 * boundaries land at 4:30 p.m. and 7 p.m., so that hour is exactly the one
 * when people are looking. Serving stale *dates* is harmless; serving a stale
 * *call to action* sends someone to a form that will not accept them.
 *
 * Same shape as LiveCountdown: the server computes the whole thing and the
 * first client render uses those props verbatim, so React sees a matching
 * tree, and an effect then re-derives from `Date.now()`. Crawlers and readers
 * without JS get the server's copy, which is never more than an hour old;
 * everyone else is exact.
 */
export default function VotingSteps({
  initialSteps,
}: {
  initialSteps: VotingStep[];
}) {
  const [steps, setSteps] = useState(initialSteps);

  useEffect(() => {
    const sync = () => {
      const fresh = getVotingSteps();
      // Replace only on an actual change: the phase moves four times in two
      // months, so this is a no-op on essentially every render.
      setSteps((current) =>
        JSON.stringify(current) === JSON.stringify(fresh) ? current : fresh,
      );
    };

    sync();
    // A tab left open across a 4:30 p.m. or 7 p.m. boundary should catch up
    // too, and the deadlines are minute-precise, so a minute is the interval.
    const id = setInterval(sync, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <ol className="border-t border-border-light">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="grid md:grid-cols-[6rem_1fr] gap-y-3 px-6 py-10 md:px-14 border-b border-border-light last:border-b-0"
        >
          <div
            className="font-sans font-medium leading-none text-[clamp(2rem,3.5vw,2.75rem)] tabular-nums text-accent"
            aria-hidden="true"
          >
            {i + 1}
          </div>
          <div>
            <h3 className="font-sans font-medium text-[1.3rem] leading-[1.25] tracking-[-0.02em] mb-2.5">
              <span className="sr-only">Step {i + 1}: </span>
              {step.title}
            </h3>
            <p className="font-serif text-[1.05rem] leading-[1.55] text-text-secondary max-w-[60ch]">
              {step.body}
            </p>
            {step.action && (
              <div className="mt-5">
                <Button
                  as={step.action.external ? "external-link" : "link"}
                  variant={i === 1 ? "auburn" : "ghost"}
                  href={step.action.href}
                >
                  {step.action.label}
                </Button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
