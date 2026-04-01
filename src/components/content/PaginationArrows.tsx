export function PaginationArrows({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 ml-auto">
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="w-7 h-7 flex items-center justify-center rounded border border-border-light type-label-sm transition-colors hover:border-dark disabled:opacity-30 disabled:hover:border-border-light"
        aria-label="Previous page"
      >
        &#8592;
      </button>
      <span className="type-label-sm text-text-secondary">
        {page + 1}/{totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages - 1}
        className="w-7 h-7 flex items-center justify-center rounded border border-border-light type-label-sm transition-colors hover:border-dark disabled:opacity-30 disabled:hover:border-border-light"
        aria-label="Next page"
      >
        &#8594;
      </button>
    </div>
  );
}
