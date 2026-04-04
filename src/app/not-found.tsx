import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg min-h-[calc(100vh-40px)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Blueprint grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Vertical construction lines */}
        <div
          className="absolute top-0 bottom-0 left-[6.7%] w-px"
          style={{
            backgroundColor: "var(--color-charcoal-1000)",
            opacity: 0.06,
          }}
        />
        <div
          className="absolute top-0 bottom-0 left-[33.3%] w-px"
          style={{
            backgroundColor: "var(--color-charcoal-1000)",
            opacity: 0.06,
          }}
        />
        <div
          className="absolute top-0 bottom-0 left-[50%] w-px"
          style={{
            backgroundColor: "var(--color-charcoal-1000)",
            opacity: 0.08,
          }}
        />
        <div
          className="absolute top-0 bottom-0 right-[33.3%] w-px"
          style={{
            backgroundColor: "var(--color-charcoal-1000)",
            opacity: 0.06,
          }}
        />
        <div
          className="absolute top-0 bottom-0 right-[6.7%] w-px"
          style={{
            backgroundColor: "var(--color-charcoal-1000)",
            opacity: 0.06,
          }}
        />

        {/* Horizontal construction lines */}
        <div
          className="absolute left-0 right-0 top-[20%] h-px"
          style={{
            backgroundColor: "var(--color-charcoal-1000)",
            opacity: 0.06,
          }}
        />
        <div
          className="absolute left-0 right-0 top-[50%] h-px"
          style={{
            backgroundColor: "var(--color-charcoal-1000)",
            opacity: 0.08,
          }}
        />
        <div
          className="absolute left-0 right-0 top-[80%] h-px"
          style={{
            backgroundColor: "var(--color-charcoal-1000)",
            opacity: 0.06,
          }}
        />

        {/* Main horizontal accent through center */}
        <div
          className="absolute left-[6.7%] right-[6.7%] top-[50%] h-[2px]"
          style={{
            backgroundColor: "var(--color-auburn-800)",
            opacity: 0.25,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-5">
        {/* 404 — blueprint watermark style */}
        <span
          className="block select-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: "clamp(8rem, 22vw, 16rem)",
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            color: "var(--color-charcoal-1000)",
            opacity: 0.07,
            fontVariantNumeric: "tabular-nums",
          }}
          aria-hidden="true"
        >
          404
        </span>

        {/* Label above heading */}
        <span className="type-label text-accent mb-4 tracking-[0.2em]">
          Not Found
        </span>

        {/* Heading */}
        <h1
          className="type-display-sm mb-4"
          style={{ color: "var(--color-charcoal-1000)" }}
        >
          Nothing here yet.
        </h1>

        {/* Body */}
        <p
          className="type-body-sm mb-10 max-w-[420px]"
          style={{ color: "var(--color-charcoal-600)" }}
        >
          We haven&apos;t built this page yet. Even the best blueprints have
          unbuilt sections - you&apos;ve found one.
        </p>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Button as="link" href="/" variant="charcoal">
            Back to Home
          </Button>
          <Button as="link" href="/memos" variant="ghost">
            Explore the Memos
          </Button>
        </div>
      </div>

      {/* Bottom corner coordinate mark — blueprint detail */}
      <div
        className="absolute bottom-4 right-5 type-mono-sm pointer-events-none"
        style={{ color: "var(--color-charcoal-300)", opacity: 0.5 }}
        aria-hidden="true"
      >
        404.00
      </div>
    </div>
  );
}
