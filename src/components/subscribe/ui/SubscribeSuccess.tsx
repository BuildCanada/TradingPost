import { Button } from "@/components/ui/button";

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
        <Button as="button" onClick={onClose}>
          Close
        </Button>
      )}
    </div>
  );
}
