"use client";

import {
  useSubscribeStore,
  type SubscribeSource,
} from "@/components/subscribe/store";

/**
 * The call to action at the foot of an ElectionCard that opens the subscribe
 * modal instead of navigating somewhere.
 *
 * A real <button>, and deliberately not the card itself: a button may only
 * contain phrasing content, and these cards hold a heading and a list, so
 * wrapping the whole card in one would be invalid markup. Instead the button
 * stays where it already looked like a button and stretches its hit area over
 * the whole card with an ::after overlay — the card's own `relative` is what
 * that resolves against. The result keeps the entire surface clickable, with
 * one accessible name, which is what the anchor version gives you.
 */
export function SubscribeCardTrigger({
  className,
  headline,
  source,
  children,
}: {
  className: string;
  /** replaces the modal's title, so the card can make its own promise */
  headline: string;
  source: SubscribeSource;
  children: React.ReactNode;
}) {
  const openModal = useSubscribeStore((s) => s.openModal);

  return (
    <button
      type="button"
      onClick={() => openModal(source, undefined, headline)}
      className={`${className} cursor-pointer after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      {children}
    </button>
  );
}
