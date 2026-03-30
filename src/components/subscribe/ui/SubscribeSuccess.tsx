interface SubscribeSuccessProps {
  onClose?: () => void;
}

export function SubscribeSuccess({ onClose }: SubscribeSuccessProps) {
  return (
    <div>
      <h3 className="type-title mb-3">Good call.</h3>
      <p className="type-body text-[var(--color-text-secondary)] mb-4">
        We&apos;re building the case for a more prosperous Canada. You&apos;ll
        be the first to know when we make progress.
      </p>
      {onClose && (
        <button
          onClick={onClose}
          className="bg-[var(--color-dark)] text-[var(--color-bg)] type-label px-5 py-3 hover:bg-[var(--color-accent)] transition-colors cursor-pointer"
        >
          Close
        </button>
      )}
    </div>
  );
}
