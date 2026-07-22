"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { pledgeSharePath } from "../2026/pledge/pledge-slug";

/* "Pledge to vote" CTA — opens the same modal treatment as the navbar
   Subscribe button. Submitting records the pledge (via /api/elections/pledge
   → pledges_to_vote) and redirects to the pledger's unique shareable page. */
export function PledgeButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await fetch("/api/elections/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, region: "toronto" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      posthog.identify(email, { email });
      posthog.capture("pledged_to_vote", { source: "get-involved" });
      // keep the button disabled while we navigate to the shared page
      router.push(pledgeSharePath(name));
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const inputClass =
    "border border-charcoal-300 bg-white px-3 py-2.5 type-body placeholder:text-charcoal-400 outline-none focus:border-charcoal-1000 transition-colors";

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open) posthog.capture("pledge_modal_opened", { source: "get-involved" });
      }}
    >
      <Dialog.Trigger className={className}>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[60]" />
        <Dialog.Popup
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linen-100 border border-charcoal-300 w-[90vw] max-w-md z-[60]"
          style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}
        >
          <Dialog.Title
            className="type-title"
            style={{ marginBottom: "clamp(0.375rem, 1.5vw, 0.75rem)" }}
          >
            Pledge to vote
          </Dialog.Title>
          <div style={{ marginBottom: "clamp(1rem, 3vw, 1.5rem)" }}>
            <Dialog.Description
              className="type-body"
              style={{ marginBottom: "clamp(0.375rem, 1.5vw, 0.75rem)" }}
            >
              Toronto votes Monday, October 26. Put your name on the record.
            </Dialog.Description>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
              className={inputClass}
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              required
              className={inputClass}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className={inputClass}
            />
            <Button
              as="button"
              type="submit"
              disabled={loading}
              className="self-start"
            >
              {loading ? "Recording..." : "Pledge to vote"}
            </Button>
            {error && <p className="type-label-sm text-auburn-800">{error}</p>}
          </form>
          <Dialog.Close
            aria-label="Close dialog"
            className="absolute w-11 h-11 flex items-center justify-center text-charcoal-600 hover:text-charcoal-1000 hover:bg-charcoal-200/30 rounded-sm transition-colors cursor-pointer"
            style={{
              top: "clamp(0.75rem, 2.5vw, 1.25rem)",
              right: "clamp(0.75rem, 2.5vw, 1.25rem)",
            }}
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
