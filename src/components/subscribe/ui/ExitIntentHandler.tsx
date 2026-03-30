"use client";

import { useEffect } from "react";
import { useSubscribeStore } from "../store";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function ExitIntentHandler() {
  const subscribed = useSubscribeStore((s) => s.subscribed);
  const dismissed = useSubscribeStore((s) => s.dismissed);
  const openModal = useSubscribeStore((s) => s.openModal);

  useEffect(() => {
    if (subscribed) return;

    if (dismissed && Date.now() - dismissed < SEVEN_DAYS_MS) return;

    let triggered = false;

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
