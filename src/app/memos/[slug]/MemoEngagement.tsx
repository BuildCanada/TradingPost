"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatEditorialLongDate } from "@/lib/date-format";

type Endorser = { name: string; created_at: string };
type Critique = { id: number; name: string; body: string; created_at: string };

interface Props {
  memoSlug: string;
  endorsementsCount: number;
  critiquesCount: number;
  recentEndorsers: Endorser[];
  critiques: Critique[];
  // Resolved server-side from the OAuth session (/me).
  signedIn: boolean;
  engagementReady: boolean;
}

type Kind = "endorsement" | "critique";

const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/;

function loginHref(memoSlug: string) {
  return `/api/auth/login?redirect=${encodeURIComponent(`/memos/${memoSlug}`)}`;
}

async function postJson(
  url: string,
  body: unknown,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body
  }
  return { ok: res.ok, status: res.status, data };
}

function formatDate(iso: string) {
  return formatEditorialLongDate(iso);
}

function splitFirstSentence(text: string): { first: string; rest: string } {
  const trimmed = text.trim();
  const match = trimmed.match(/^[\s\S]*?[.!?](?=\s|$)/);
  if (!match) return { first: trimmed, rest: "" };
  const first = match[0];
  const rest = trimmed.slice(first.length).trim();
  return { first: first.trim(), rest };
}

export function MemoEngagement(props: Props) {
  const router = useRouter();
  const [endorsementsCount, setEndorsementsCount] = useState(props.endorsementsCount);
  const [recentEndorsers, setRecentEndorsers] = useState<Endorser[]>(props.recentEndorsers);
  const [pendingCritique, setPendingCritique] = useState<Critique | null>(null);
  // Never mutated client-side — read straight from props (no state needed).
  const critiquesCount = props.critiquesCount;
  const critiques = props.critiques;
  const [openKind, setOpenKind] = useState<Kind | null>(null);

  const openEngagement = (kind: Kind) => {
    // Not signed in → bounce through York Factory's OAuth (LinkedIn) and come
    // back to this memo. The button effectively becomes "sign in to <kind>".
    if (!props.signedIn) {
      window.location.href = loginHref(props.memoSlug);
      return;
    }
    setOpenKind(kind);
  };

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

  const endorseLabel = props.signedIn ? "Endorse this memo" : "Sign in to endorse";
  const critiqueLabel = props.signedIn ? "Critique this memo" : "Sign in to critique";

  return (
    <section
      data-testid="memo-engagement"
      className="print-hide mt-12 pt-10 border-t border-border-light"
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button as="button" variant="charcoal" onClick={() => openEngagement("endorsement")}>
          {endorseLabel}
        </Button>
        <Button as="button" variant="ghost" onClick={() => openEngagement("critique")}>
          {critiqueLabel}
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
            <p className="type-body text-text-secondary">No critiques yet.</p>
          ) : (
            <ul className="space-y-5">
              {pendingCritique && <CritiqueItem critique={pendingCritique} pending />}
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
        engagementReady={props.engagementReady}
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
  engagementReady: boolean;
  onClose: () => void;
  onEndorsed: (endorser: Endorser) => void;
  onCritiqued: (critique: Critique) => void;
  onDuplicate: (kind: Kind) => void;
}

function EngagementDialog({
  kind,
  memoSlug,
  engagementReady,
  onClose,
  onEndorsed,
  onCritiqued,
  onDuplicate,
}: DialogProps) {
  const [needsPostal, setNeedsPostal] = useState(!engagementReady);
  const [postalCode, setPostalCode] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const open = kind !== null;

  useEffect(() => {
    if (!open) return;
    setNeedsPostal(!engagementReady);
    setPostalCode("");
    setBody("");
    setError(null);
    setSubmitting(false);
  }, [open, kind, engagementReady]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!kind) return;
    setError(null);

    if (needsPostal && !POSTAL_CODE_REGEX.test(postalCode.trim())) {
      setError("Please enter a valid Canadian postal code (e.g. A1A 1A1).");
      return;
    }
    if (kind === "critique" && body.trim().length < 5) {
      setError("Please write a critique of at least 5 characters.");
      return;
    }

    setSubmitting(true);
    try {
      // 1) Save the postal code first if we still need it.
      if (needsPostal) {
        const postalRes = await postJson("/api/profile/postal", {
          postal_code: postalCode.trim(),
        });
        if (postalRes.status === 401) return redirectToLogin();
        if (!postalRes.ok) {
          setError(messageFrom(postalRes.data, "Could not save your postal code."));
          return;
        }
      }

      // 2) Submit the engagement.
      const res = await postJson(`/api/memos/${memoSlug}/engagement`, {
        kind,
        ...(kind === "critique" ? { body: body.trim() } : {}),
      });

      if (res.status === 401) return redirectToLogin();
      if (res.status === 409) {
        onDuplicate(kind);
        return;
      }
      if (res.status === 422 && errorCode(res.data) === "postal_code_required") {
        // Session said ready but York Factory disagrees (token race) — collect it.
        setNeedsPostal(true);
        setError("Please add your postal code to continue.");
        return;
      }
      if (!res.ok) {
        setError(messageFrom(res.data, "Something went wrong. Please try again."));
        return;
      }

      const data = res.data as { id: number; name: string; body?: string; created_at: string };
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
    } finally {
      setSubmitting(false);
    }
  };

  const redirectToLogin = () => {
    window.location.href = loginHref(memoSlug);
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
              ? "Your endorsement is published under your name."
              : "Share your critique. A critique must target the memo content constructively. Anything self-promotional, ad hominem, or otherwise hostile will not be approved and may be removed."}
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {needsPostal && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="engagement-postal" className="type-label-sm text-text-secondary">
                  Postal code
                </label>
                <input
                  id="engagement-postal"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="A1A 1A1"
                  required
                  maxLength={7}
                  className={inputClass}
                />
              </div>
            )}

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
              {submitting
                ? "Submitting…"
                : kind === "endorsement"
                  ? "Submit endorsement"
                  : "Submit critique"}
            </Button>

            {error && <p className="type-label-sm text-auburn-800">{error}</p>}
          </form>

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

function errorCode(data: unknown): string | undefined {
  return (data as { error?: string } | null)?.error;
}

function messageFrom(data: unknown, fallback: string): string {
  const body = data as { errors?: string[]; error?: string; message?: string } | null;
  return body?.errors?.join(", ") || body?.message || body?.error || fallback;
}
