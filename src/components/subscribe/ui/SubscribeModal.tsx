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
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-bg)] border border-[var(--color-border)] p-8 w-[90vw] max-w-md z-[60]">
          <Dialog.Title className="type-title mb-2">
            {subscribed ? "You're in." : "Subscribe"}
          </Dialog.Title>
          <Dialog.Description className="type-body text-[var(--color-text-secondary)] mb-5">
            {subscribed
              ? "Thanks for subscribing."
              : "Stay informed on bold ideas for Canada."}
          </Dialog.Description>
          {subscribed ? (
            <SubscribeSuccess onClose={handleClose} />
          ) : (
            <SubscribeForm
              source={triggerSource ?? "navbar"}
              onSuccess={handleClose}
            />
          )}
          <Dialog.Close className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center type-label text-[var(--color-text-muted)] hover:text-[var(--color-dark)] cursor-pointer">
            ✕
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
