"use client";

import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import type { YFAgreementDetail } from "@/lib/api/types";
import AgreementDetail from "./AgreementDetail";

export default function AgreementModal({
  agreement,
}: {
  agreement: YFAgreementDetail;
}) {
  const router = useRouter();

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[60]" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linen-100 border border-[#cdc4bd] w-[95vw] max-w-5xl z-[60] max-h-[90vh] overflow-y-auto">
          <AgreementDetail agreement={agreement} hideBackLink />
          <Dialog.Close
            aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-charcoal-600 hover:text-charcoal-1000 hover:bg-charcoal-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
