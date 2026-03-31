interface SubscribeSuccessProps {
  onClose?: () => void;
}

export function SubscribeSuccess({ onClose }: SubscribeSuccessProps) {
  return (
    <div>
      <h3 className="type-title mb-3">Good call.</h3>
      <p className="type-body text-charcoal-600 mb-4">
        We&apos;re building the case for a more prosperous Canada. You&apos;ll
        be the first to know when we make progress.
      </p>
      {onClose && (
        <button
          onClick={onClose}
          className="bg-charcoal-1000 text-linen-100 type-label px-5 py-3 hover:bg-auburn-800 transition-colors cursor-pointer"
        >
          Close
        </button>
      )}
    </div>
  );
}
