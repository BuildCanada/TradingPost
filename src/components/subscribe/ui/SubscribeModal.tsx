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
          <Dialog.Close className="absolute w-8 h-8 flex items-center justify-center type-label text-charcoal-400 hover:text-charcoal-1000 cursor-pointer" style={{ top: "clamp(1rem, 3vw, 1.5rem)", right: "clamp(1rem, 3vw, 1.5rem)" }}>
            ✕
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
