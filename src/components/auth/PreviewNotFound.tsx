import { DraftPreviewBanner } from "./DraftPreviewBanner";

// Shown when an admin (preview token present) opens a slug that 404s — the
// content may be an unsaved/renamed draft. Non-admins get a plain notFound().
// `label` is the singular content noun, e.g. "Memo", "Post", "Builder".
export function PreviewNotFound({
  label,
  slug,
}: {
  label: string;
  slug: string;
}) {
  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <div className="max-w-[720px] mx-auto px-[5vw] md:px-[10vw] py-24 flex flex-col items-center gap-8 text-center">
        <p className="type-label text-text-secondary">404</p>
        <h1 className="type-title">{label} not found</h1>
        <p className="type-body text-text-secondary">
          This {label.toLowerCase()} doesn&apos;t exist or hasn&apos;t been
          published yet.
        </p>
        <DraftPreviewBanner state="draft-not-found" slug={slug} />
      </div>
    </div>
  );
}
