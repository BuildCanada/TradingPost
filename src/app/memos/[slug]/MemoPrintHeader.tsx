interface MemoPrintHeaderProps {
  title: string;
  authorName: string;
  authorTitle: string | null;
  authorImage: string | null;
  date: string;
  url: string;
  brand?: "canada" | "toronto" | "polling";
}

/* Print-only header: Build Canada branding + memo meta. Hidden on screen
   via the .print-only rules in globals.css. */
export function MemoPrintHeader({
  title,
  authorName,
  authorTitle,
  authorImage,
  date,
  url,
  brand = "canada",
}: MemoPrintHeaderProps) {
  return (
    <div className="print-only mb-10 pb-5 border-b border-black">
      <div className="flex items-center justify-between mb-8">
        {brand === "toronto" || brand === "polling" ? (
          /* The nav's Toronto lockup: white wordmark + "Toronto" in the
             accent-blue box (see Navbar.tsx). Forced color-adjust so the
             box prints. */
          <div className={`${brand === "toronto" ? "theme-toronto " : ""}bg-accent border-2 border-charcoal-1000 flex items-center gap-3 px-4 py-3 [-webkit-print-color-adjust:exact] [print-color-adjust:exact]`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logos/logo-standard.svg"
              alt="Build Canada"
              width={86}
              height={40}
              className="h-[36px] w-auto"
            />
            <span aria-hidden="true" className="self-stretch w-px bg-white" />
            <span className="font-sans font-medium text-white text-[18px] leading-none whitespace-nowrap">
              {brand === "toronto" ? "Toronto" : "Polling"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logos/sticker-build-canada-logo.webp"
              alt="Build Canada"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="type-label font-semibold tracking-wider">Build Canada</span>
          </div>
        )}
        <span className="type-label break-all text-right">
          {url.replace(/^https?:\/\//, "")}
        </span>
      </div>
      <h1 className="type-title mb-4">{title}</h1>
      <div className="flex items-center gap-4">
        {authorImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={authorImage}
            alt={authorName}
            width={56}
            height={56}
            className="w-14 h-14 object-cover shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="type-label font-medium m-0">{authorName}</p>
          {authorTitle && (
            <p className="type-label text-text-secondary m-0 mt-0.5">
              {authorTitle}
            </p>
          )}
          <p className="type-label text-text-secondary m-0 mt-0.5">{date}</p>
        </div>
      </div>
    </div>
  );
}
