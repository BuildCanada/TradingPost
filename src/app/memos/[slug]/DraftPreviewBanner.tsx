import Link from "next/link";

type BannerState = "viewing-draft" | "draft-not-found";

interface DraftPreviewBannerProps {
  state: BannerState;
  slug: string;
}

export function DraftPreviewBanner({ state }: DraftPreviewBannerProps) {
  if (state === "viewing-draft") {
    return (
      <div className="w-full bg-amber-500 text-white text-sm px-4 py-2 flex items-center justify-between">
        <span className="font-medium">DRAFT — not yet published</span>
        <Link href="/api/auth/logout" className="underline">
          Exit preview
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full border border-amber-400 bg-amber-50 text-amber-900 text-sm px-4 py-3 flex items-center gap-2">
      <span>No draft found for this slug.</span>
      <Link href="/api/auth/logout" className="underline ml-auto">
        Exit preview mode
      </Link>
    </div>
  );
}
