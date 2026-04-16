"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useSubscribeStore } from "../store";
import { SubscribeForm } from "./SubscribeForm";
import { SubscribeSuccess } from "./SubscribeSuccess";

export function SubscribeModal() {
  const isOpen = useSubscribeStore((s) => s.isOpen);
  const subscribed = useSubscribeStore((s) => s.subscribed);
  const triggerSource = useSubscribeStore((s) => s.triggerSource);
  const closeModal = useSubscribeStore((s) => s.closeModal);
  const setDismissed = useSubscribeStore((s) => s.setDismissed);

  const handleClose = () => {
    if (!subscribed) {
      setDismissed();
    }
    closeModal();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[60]" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linen-100 border border-charcoal-300 w-[90vw] max-w-md z-[60]" style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}>
          <Dialog.Title className="type-title" style={{ marginBottom: "clamp(0.375rem, 1.5vw, 0.75rem)" }}>
            {subscribed ? "You're in." : "Build Canada"}
          </Dialog.Title>
          <div style={{ marginBottom: "clamp(1rem, 3vw, 1.5rem)" }}>
            {subscribed ? (
              <Dialog.Description className="type-body text-charcoal-600">
                Thanks for subscribing.
              </Dialog.Description>
            ) : (
              <>
                <Dialog.Description className="type-body" style={{ marginBottom: "clamp(0.375rem, 1.5vw, 0.75rem)" }}>
                  We believe Canada should be the most prosperous country in the world 🏗️🇨🇦
                </Dialog.Description>
                <p className="type-label font-bold text-charcoal-600">
                  Over 10,000 subscribers
                </p>
              </>
            )}
          </div>
          {subscribed ? (
            <SubscribeSuccess onClose={handleClose} />
          ) : (
            <SubscribeForm
              source={triggerSource ?? "navbar"}
              onSuccess={handleClose}
            />
          )}
          <Dialog.Close aria-label="Close dialog" className="absolute w-11 h-11 flex items-center justify-center text-charcoal-600 hover:text-charcoal-1000 hover:bg-charcoal-200/30 rounded-sm transition-colors cursor-pointer" style={{ top: "clamp(0.75rem, 2.5vw, 1.25rem)", right: "clamp(0.75rem, 2.5vw, 1.25rem)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
