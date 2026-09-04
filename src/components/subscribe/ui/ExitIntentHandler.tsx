"use client";

import { useEffect } from "react";
import { useSubscribeStore } from "../store";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Whether exit intent should be listening at all.
 *
 * Two gates, and they are the whole feature: never ask someone who has
 * already subscribed, and never ask someone who has already been asked and
 * said no — until the dismissal is a week old, at which point it is fair to
 * ask again. `dismissed` is set by SubscribeModal on any close without a
 * signup, so opening the modal from the navbar and closing it counts as
 * having been asked.
 *
 * Pulled out of the effect as a pure function so the rule can be tested
 * without a DOM and a mouse.
 */
export function shouldArmExitIntent(
  { subscribed, dismissed }: { subscribed: boolean; dismissed: number | null },
  now: number = Date.now(),
): boolean {
  if (subscribed) return false;
  if (dismissed !== null && now - dismissed < SEVEN_DAYS_MS) return false;
  return true;
}

export function ExitIntentHandler() {
  const subscribed = useSubscribeStore((s) => s.subscribed);
  const dismissed = useSubscribeStore((s) => s.dismissed);
  const openModal = useSubscribeStore((s) => s.openModal);

  useEffect(() => {
    if (!shouldArmExitIntent({ subscribed, dismissed })) return;

    /* Scoped to this effect, so the modal is offered at most once per mount.
       Mounted on a layout (see app/toronto/layout.tsx) that survives
       client-side navigation, this means once per visit to the section
       rather than once per page. */
    let triggered = false;

    /* Only upward: the pointer crossing the top edge is the gesture that
       ends in the tab bar, the close button or the address bar. Leaving
       sideways or downward is not someone leaving. Touch devices never fire
       mouseleave at all, so this is desktop-only by nature. */
    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered) return;
      if (e.clientY <= 0) {
        triggered = true;
        openModal("exit-intent");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [subscribed, dismissed, openModal]);

  return null;
}
