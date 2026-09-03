import posthog from "posthog-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SubscribeState {
  isOpen: boolean;
  subscribed: boolean;
  dismissed: number | null;
  triggerSource: "navbar" | "exit-intent" | "footer" | "inline" | null;
  /* Seeds the modal's email field when a surface captured it first (e.g. the
     Toronto hero's inline input). */
  prefillEmail: string | null;

  openModal: (
    source: "navbar" | "exit-intent" | "footer" | "inline",
    prefillEmail?: string,
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

      openModal: (source, prefillEmail) =>
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
          };
        }),
      closeModal: () =>
        set({ isOpen: false, triggerSource: null, prefillEmail: null }),
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
