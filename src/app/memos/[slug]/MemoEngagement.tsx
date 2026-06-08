"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { API_ORIGIN, API_URL, apiPost, type ApiPostError } from "@/lib/api/client";

type Endorser = { name: string; created_at: string };
type Critique = { id: number; name: string; body: string; created_at: string };

interface Props {
  memoSlug: string;
  endorsementsCount: number;
  critiquesCount: number;
  recentEndorsers: Endorser[];
  critiques: Critique[];
}

interface LinkedinPayload {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
}

type Kind = "endorsement" | "critique";

const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/;

const TRUSTED_API_ORIGIN =
  process.env.NEXT_PUBLIC_YORK_FACTORY_ORIGIN || API_ORIGIN;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
}

function splitFirstSentence(text: string): { first: string; rest: string } {
  const trimmed = text.trim();
  // Match characters up to and including the first sentence-ending punctuation
  // followed by whitespace or end of string.
  const match = trimmed.match(/^[\s\S]*?[.!?](?=\s|$)/);
  if (!match) return { first: trimmed, rest: "" };
  const first = match[0];
  const rest = trimmed.slice(first.length).trim();
  return { first: first.trim(), rest };
}

export function MemoEngagement(props: Props) {
  const router = useRouter();
  const [endorsementsCount, setEndorsementsCount] = useState(props.endorsementsCount);
  const [critiquesCount, setCritiquesCount] = useState(props.critiquesCount);
  const [recentEndorsers, setRecentEndorsers] = useState<Endorser[]>(props.recentEndorsers);
  const [critiques, setCritiques] = useState<Critique[]>(props.critiques);
  const [pendingCritique, setPendingCritique] = useState<Critique | null>(null);
  const [openKind, setOpenKind] = useState<Kind | null>(null);

  const handleEndorsed = (endorser: Endorser) => {
    setEndorsementsCount((c) => c + 1);
    setRecentEndorsers((list) => [endorser, ...list].slice(0, 5));
    setOpenKind(null);
    toast.success("Thanks for endorsing this memo.");
    router.refresh();
  };

  const handleCritiqued = (critique: Critique) => {
    setPendingCritique(critique);
    setOpenKind(null);
    toast.success("Critique submitted for review.");
    router.refresh();
  };

  const handleDuplicate = (kind: Kind) => {
    toast.error(
      kind === "endorsement"
        ? "You've already endorsed this memo."
        : "You've already submitted a critique for this memo.",
    );
    setOpenKind(null);
  };

  return (
    <section
      data-testid="memo-engagement"
      className="print-hide mt-12 pt-10 border-t border-border-light"
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button
          as="button"
          variant="charcoal"
          onClick={() => setOpenKind("endorsement")}
        >
          Endorse this memo
        </Button>
        <Button
          as="button"
          variant="ghost"
          onClick={() => setOpenKind("critique")}
        >
          Critique this memo
        </Button>
        <span className="type-label text-text-secondary ml-auto">
          {endorsementsCount} {endorsementsCount === 1 ? "endorsement" : "endorsements"}
          {" · "}
          {critiquesCount} {critiquesCount === 1 ? "critique" : "critiques"}
        </span>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="type-label mb-3">Recent endorsers</h3>
          {recentEndorsers.length === 0 ? (
            <p className="type-body text-text-secondary">
              No endorsements yet. Be the first.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentEndorsers.map((e, i) => (
                <li
                  key={`${e.name}-${e.created_at}-${i}`}
                  className="type-body flex items-baseline justify-between gap-3"
                >
                  <span>{e.name}</span>
                  <span className="type-label-sm text-text-secondary">
                    {formatDate(e.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="type-label mb-3">Critiques</h3>
          {critiques.length === 0 && !pendingCritique ? (
            <p className="type-body text-text-secondary">
              No critiques yet.
            </p>
          ) : (
            <ul className="space-y-5">
              {pendingCritique && (
                <CritiqueItem critique={pendingCritique} pending />
              )}
              {critiques.map((c) => (
                <CritiqueItem key={c.id} critique={c} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <EngagementDialog
        kind={openKind}
        memoSlug={props.memoSlug}
        onClose={() => setOpenKind(null)}
        onEndorsed={handleEndorsed}
        onCritiqued={handleCritiqued}
        onDuplicate={handleDuplicate}
      />
    </section>
  );
}

function CritiqueItem({ critique, pending = false }: { critique: Critique; pending?: boolean }) {
  const [open, setOpen] = useState(false);
  const { first, rest } = splitFirstSentence(critique.body);
  const hasMore = rest.length > 0;

  return (
    <li className={`border-l-2 ${pending ? "border-yellow-500" : "border-border-light"} pl-4`}>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="type-body font-medium">{critique.name}</span>
        <span className={`type-label-sm ${pending ? "text-yellow-700" : "text-text-secondary"}`}>
          {pending ? "Pending review" : formatDate(critique.created_at)}
        </span>
      </div>
      <p className="type-body whitespace-pre-wrap">
        {first}
        {hasMore && (
          <>
            {" "}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Read full critique by ${critique.name}`}
              title="Read full critique"
              className="inline-flex items-center justify-center w-5 h-5 align-text-bottom text-text-secondary hover:text-charcoal-1000 transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 9v4h4M13 7V3H9M13 3l-5 5M3 13l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </p>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[60]" />
          <Dialog.Popup
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linen-100 border border-charcoal-300 w-[90vw] max-w-2xl z-[60] max-h-[85vh] overflow-y-auto"
            style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            <Dialog.Title className="type-title" style={{ marginBottom: "clamp(0.25rem, 1vw, 0.5rem)" }}>
              {critique.name}
            </Dialog.Title>
            <Dialog.Description className="type-label-sm text-text-secondary" style={{ marginBottom: "clamp(0.75rem, 2vw, 1.25rem)" }}>
              {pending ? "Pending review" : formatDate(critique.created_at)}
            </Dialog.Description>
            <p className="type-body whitespace-pre-wrap">{critique.body}</p>
            <Dialog.Close
              aria-label="Close dialog"
              className="absolute w-11 h-11 flex items-center justify-center text-charcoal-600 hover:text-charcoal-1000 hover:bg-charcoal-200/30 rounded-sm transition-colors cursor-pointer"
              style={{ top: "clamp(0.75rem, 2.5vw, 1.25rem)", right: "clamp(0.75rem, 2.5vw, 1.25rem)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </li>
  );
}

interface DialogProps {
  kind: Kind | null;
  memoSlug: string;
  onClose: () => void;
  onEndorsed: (endorser: Endorser) => void;
  onCritiqued: (critique: Critique) => void;
  onDuplicate: (kind: Kind) => void;
}

function EngagementDialog({
  kind,
  memoSlug,
  onClose,
  onEndorsed,
  onCritiqued,
  onDuplicate,
}: DialogProps) {
  const [phase, setPhase] = useState<"connect" | "verifying" | "ready">("connect");
  const [payload, setPayload] = useState<LinkedinPayload | null>(null);
  const [verifiedTicket, setVerifiedTicket] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const popupTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const open = kind !== null;

  // Reset state every time we open or change kind.
  useEffect(() => {
    if (!open) return;

    setPhase("connect");
    setPayload(null);
    setVerifiedTicket(null);
    setPostalCode("");
    setBody("");
    setError(null);
    setSubmitting(false);
  }, [open, kind]);

  // Listen for the popup's postMessage.
  useEffect(() => {
    if (!open) return;

    const handler = (event: MessageEvent) => {
      if (TRUSTED_API_ORIGIN && event.origin !== TRUSTED_API_ORIGIN) return;
      const data = event.data as
        | { type?: string; verifiedTicket?: string; payload?: LinkedinPayload; error?: string }
        | null;
      if (!data || data.type !== "linkedin-verified") return;

      if (data.error) {
        setError(`LinkedIn verification failed: ${data.error}`);
        setPhase("connect");
        return;
      }
      if (data.verifiedTicket && data.payload) {
        setVerifiedTicket(data.verifiedTicket);
        setPayload(data.payload);
        setPhase("ready");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [open]);

  // Clean up popup polling on close.
  useEffect(() => {
    if (open) return;
    if (popupTimerRef.current) {
      clearInterval(popupTimerRef.current);
      popupTimerRef.current = null;
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
  }, [open]);

  const startLinkedin = () => {
    if (!kind) return;
    setError(null);
    setPhase("verifying");

    const startUrl = `${API_URL.replace(/\/api\/v1\/?$/, "")}/api/v1/auth/linkedin/start?kind=${kind}&memo_slug=${encodeURIComponent(memoSlug)}`;

    const w = 600;
    const h = 720;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(
      startUrl,
      "linkedin-verify",
      `width=${w},height=${h},left=${left},top=${top}`,
    );

    if (!popup) {
      setError("Popup blocked. Please allow popups for this site and try again.");
      setPhase("connect");
      return;
    }
    popupRef.current = popup;

    popupTimerRef.current = setInterval(() => {
      if (popup.closed) {
        if (popupTimerRef.current) {
          clearInterval(popupTimerRef.current);
          popupTimerRef.current = null;
        }
        // Only revert to connect if we never received the ticket.
        setPhase((p) => (p === "verifying" ? "connect" : p));
      }
    }, 500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!kind || !verifiedTicket || !payload) return;

    setError(null);

    if (!POSTAL_CODE_REGEX.test(postalCode)) {
      setError("Please enter a valid Canadian postal code (e.g. A1A 1A1).");
      return;
    }
    if (kind === "critique" && body.trim().length < 5) {
      setError("Please write a critique of at least 5 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const path = `/memos/${memoSlug}/${kind === "endorsement" ? "endorsements" : "critiques"}`;
      const responseBody: Record<string, unknown> = {
        verified_ticket: verifiedTicket,
        postal_code: postalCode,
      };
      if (kind === "critique") responseBody.body = body.trim();

      const data = await apiPost<{ id: number; name: string; body?: string; created_at: string }>(
        path,
        responseBody,
      );

      if (kind === "endorsement") {
        onEndorsed({ name: data.name, created_at: data.created_at });
      } else {
        onCritiqued({
          id: data.id,
          name: data.name,
          body: data.body ?? body.trim(),
          created_at: data.created_at,
        });
      }
    } catch (err) {
      const apiErr = err as ApiPostError;
      if (apiErr?.status === 409) {
        onDuplicate(kind);
        return;
      }
      const errBody = apiErr?.body as { errors?: string[]; message?: string } | undefined;
      const message =
        errBody?.errors?.join(", ") ||
        errBody?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "border border-charcoal-300 bg-white px-3 py-2.5 type-body placeholder:text-charcoal-400 outline-none focus:border-charcoal-1000 transition-colors w-full";

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[60]" />
        <Dialog.Popup
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linen-100 border border-charcoal-300 w-[90vw] max-w-md z-[60] max-h-[90vh] overflow-y-auto"
          style={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}
        >
          <Dialog.Title className="type-title" style={{ marginBottom: "clamp(0.375rem, 1.5vw, 0.75rem)" }}>
            {kind === "endorsement" ? "Endorse this memo" : "Critique this memo"}
          </Dialog.Title>
          <Dialog.Description className="type-body text-charcoal-600" style={{ marginBottom: "clamp(0.75rem, 2vw, 1.25rem)" }}>
            {kind === "endorsement"
              ? "Verify your identity through LinkedIn so your endorsement carries weight."
              : "Verify your identity through LinkedIn and share your critique.  A critique must target the memo content in a constructive or positive way.  Anything self-promotional, including an ad hominen, or is deemed anyway unwelcome or hostile, will not be approved and may be removed."}
          </Dialog.Description>

          {phase === "connect" && (
            <div className="flex flex-col gap-3">
              <Button as="button" variant="charcoal" onClick={startLinkedin}>
                Continue with LinkedIn
              </Button>
              {error && <p className="type-label-sm text-auburn-800">{error}</p>}
            </div>
          )}

          {phase === "verifying" && (
            <div className="flex flex-col gap-3">
              <p className="type-body text-charcoal-600">
                Waiting for LinkedIn… Complete the sign-in in the popup window.
              </p>
              <button
                type="button"
                onClick={() => setPhase("connect")}
                className="type-label-sm text-charcoal-600 underline self-start cursor-pointer"
              >
                Cancel
              </button>
              {error && <p className="type-label-sm text-auburn-800">{error}</p>}
            </div>
          )}

          {phase === "ready" && payload && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="border border-border-light bg-white p-3">
                <p className="type-label-sm text-text-secondary mb-1">Verified via LinkedIn</p>
                <p className="type-body font-medium">{payload.name}</p>
                {payload.email && (
                  <p className="type-label-sm text-text-secondary">
                    {payload.email}
                    {payload.email_verified && " (verified)"}
                  </p>
                )}
              </div>

              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal code (e.g. A1A 1A1)"
                required
                maxLength={7}
                className={inputClass}
              />

              {kind === "critique" && (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your critique…"
                  required
                  rows={6}
                  maxLength={10000}
                  className={`${inputClass} resize-vertical`}
                />
              )}

              <Button as="button" type="submit" disabled={submitting} className="self-start">
                {submitting ? "Submitting…" : kind === "endorsement" ? "Submit endorsement" : "Submit critique"}
              </Button>

              {error && <p className="type-label-sm text-auburn-800">{error}</p>}
            </form>
          )}

          <Dialog.Close
            aria-label="Close dialog"
            className="absolute w-11 h-11 flex items-center justify-center text-charcoal-600 hover:text-charcoal-1000 hover:bg-charcoal-200/30 rounded-sm transition-colors cursor-pointer"
            style={{ top: "clamp(0.75rem, 2.5vw, 1.25rem)", right: "clamp(0.75rem, 2.5vw, 1.25rem)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
