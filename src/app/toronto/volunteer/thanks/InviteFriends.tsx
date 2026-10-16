"use client";

import { useState, useSyncExternalStore } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

const noSubscription = () => () => {};

/**
 * The "who will you bring?" step: a ready-to-send message with the sign-up
 * link, plus the quickest ways to pass it on. The native share sheet only
 * appears where the browser has one. The server snapshot says "no", so
 * hydration matches and the button is added on the client.
 */
export function InviteFriends({ message }: { message: string }) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const canShare = useSyncExternalStore(
    noSubscription,
    () => typeof navigator.share === "function",
    () => false,
  );

  const track = (method: string) =>
    posthog.capture("volunteer_invite_shared", { method });

  const copy = async () => {
    track("copy");
    try {
      await navigator.clipboard.writeText(message);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  };

  const share = () => {
    track("native");
    navigator.share({ text: message }).catch(() => {});
  };

  return (
    <div>
      <p className="border border-dashed border-border-light bg-bg px-5 py-4 font-serif text-[1.05rem] leading-[1.5] break-words">
        {message}
      </p>
      <div className="flex flex-wrap gap-3 mt-4">
        <Button as="button" variant="auburn" onClick={copy}>
          Copy message
        </Button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp")}
          className="type-label inline-flex items-center px-5 py-3 border border-border-light hover:border-dark transition-colors"
        >
          WhatsApp
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent("Volunteer with me on Election Day?")}&body=${encodeURIComponent(message)}`}
          onClick={() => track("email")}
          className="type-label inline-flex items-center px-5 py-3 border border-border-light hover:border-dark transition-colors"
        >
          Email
        </a>
        {canShare && (
          <Button as="button" variant="ghost" onClick={share}>
            Share
          </Button>
        )}
      </div>
      <p role="status" className="type-label-sm text-accent mt-3 min-h-[1.3em]">
        {copied === "copied" && "Copied. Paste it into a text or group chat."}
        {copied === "failed" && "Select the message above to copy it."}
      </p>
    </div>
  );
}
