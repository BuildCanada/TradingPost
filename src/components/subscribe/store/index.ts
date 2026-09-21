import posthog from "posthog-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/* Where the modal was opened from. Reaches PostHog and the subscribe API as
   the signup's placement, so a new surface should get its own value rather
   than borrow the closest one. */
export type SubscribeSource =
  | "navbar"
  | "exit-intent"
  | "footer"
  | "inline"
  | "survey-interest";

interface SubscribeState {
  isOpen: boolean;
  subscribed: boolean;
  dismissed: number | null;
  triggerSource: SubscribeSource | null;
  /* Seeds the modal's email field when a surface captured it first (e.g. the
     Toronto hero's inline input). */
  prefillEmail: string | null;
  /* Replaces the modal's title when a surface is asking for the same signup
     under a different promise — the Toronto survey card sells being told when
     the survey launches, not the weekly digest. Null keeps the default. */
  headline: string | null;

  openModal: (
    source: SubscribeSource,
    prefillEmail?: string,
    headline?: string,
  ) => void;
  closeModal: () => void;
  setSubscribed: () => void;
  setDismissed: () => void;
}

export const useSubscribeStore = create<SubscribeState>()(
  persist(
    (set) => ({
      isOpen: false,
      subscribed: false,
      dismissed: null,
      triggerSource: null,
      prefillEmail: null,
      headline: null,

      openModal: (source, prefillEmail, headline) =>
        set((state) => {
          if (!state.isOpen) {
            posthog.capture("subscribe_modal_opened", {
              source,
              prefilled: Boolean(prefillEmail),
            });
          }
          return {
            isOpen: true,
            triggerSource: source,
            prefillEmail: prefillEmail ?? null,
            headline: headline ?? null,
          };
        }),
      closeModal: () =>
        set({
          isOpen: false,
          triggerSource: null,
          prefillEmail: null,
          headline: null,
        }),
      setSubscribed: () => set({ subscribed: true }),
      setDismissed: () => set({ dismissed: Date.now() }),
    }),
    {
      name: "bc-subscribe",
      partialize: (state) => ({
        subscribed: state.subscribed,
        dismissed: state.dismissed,
      }),
    }
  )
);
