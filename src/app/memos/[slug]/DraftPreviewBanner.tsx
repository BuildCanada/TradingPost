type BannerState = "viewing-draft" | "draft-not-found";

interface DraftPreviewBannerProps {
  state: BannerState;
  slug: string;
}

// Logout is a POST form (not a link) so it can't be triggered cross-site via
// <img>/<a>. Combined with the route's same-origin check, this prevents CSRF
// force-logout. display:contents keeps the form transparent to the flex layout
// so the button behaves like the link it replaces.
function ExitPreviewButton({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <form action="/api/auth/logout" method="post" className="contents">
      <button
        type="submit"
        className={`${className} [font:inherit] text-inherit cursor-pointer border-0 bg-transparent p-0`}
      >
        {label}
      </button>
    </form>
  );
}

export function DraftPreviewBanner({ state }: DraftPreviewBannerProps) {
  if (state === "viewing-draft") {
    return (
      <div className="w-full bg-amber-500 text-white text-sm px-4 py-2 flex items-center justify-between">
        <span className="font-medium">DRAFT — not yet published</span>
        <ExitPreviewButton className="underline" label="Exit preview" />
      </div>
    );
  }

  return (
    <div className="w-full border border-amber-400 bg-amber-50 text-amber-900 text-sm px-4 py-3 flex items-center gap-2">
      <span>No draft found for this slug.</span>
      <ExitPreviewButton className="underline ml-auto" label="Exit preview mode" />
    </div>
  );
}
