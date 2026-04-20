import posthog from "posthog-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SubscribeState {
  isOpen: boolean;
  subscribed: boolean;
  dismissed: number | null;
  triggerSource: "navbar" | "exit-intent" | "footer" | "inline" | null;

  openModal: (source: "navbar" | "exit-intent" | "footer" | "inline") => void;
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

      openModal: (source) =>
        set((state) => {
          if (!state.isOpen) {
            posthog.capture("subscribe_modal_opened", { source });
          }
          return { isOpen: true, triggerSource: source };
        }),
      closeModal: () =>
        set({ isOpen: false, triggerSource: null }),
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
