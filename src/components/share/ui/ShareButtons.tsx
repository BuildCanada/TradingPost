"use client";

import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() =>
          openShareWindow(
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
          )
        }
        className="w-12 h-12 flex items-center justify-center bg-dark text-white hover:bg-accent transition-colors cursor-pointer"
        aria-label="Share on X"
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
      <button
        onClick={() =>
          openShareWindow(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
          )
        }
        className="w-12 h-12 flex items-center justify-center bg-dark text-white hover:bg-accent transition-colors cursor-pointer"
        aria-label="Share on LinkedIn"
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </button>
      <button
        onClick={() =>
          openShareWindow(
            `https://www.threads.net/intent?postText=${encodedTitle}%20${encodedUrl}`
          )
        }
        className="w-12 h-12 flex items-center justify-center bg-dark text-white hover:bg-accent transition-colors cursor-pointer"
        aria-label="Share on Threads"
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.243 1.33-3.023.88-.744 2.084-1.168 3.58-1.263 1.073-.065 2.074.02 2.99.26-.124-.842-.51-1.398-1.13-1.67-.733-.32-1.778-.346-2.657.168-.378.22-.7.52-.958.895l-1.674-1.14c.417-.627.96-1.138 1.598-1.521 1.357-.792 3.076-.847 4.49-.148 1.244.617 1.947 1.755 2.04 3.29.082.026.164.054.245.084 1.643.6 2.656 1.574 3.18 2.837.632 1.525.578 3.396-.145 5.032-.872 1.973-2.39 3.204-4.513 3.66-.71.15-1.48.226-2.31.226h-.007zM11.746 16.5c.91.048 1.628-.186 2.126-.697.536-.548.864-1.362.984-2.428-.72-.198-1.523-.277-2.393-.224-.973.06-1.737.325-2.271.789-.448.39-.667.867-.644 1.398.041.714.425 1.162 1.198 1.162z" />
        </svg>
      </button>
      <button
        onClick={handleCopyLink}
        className="w-12 h-12 flex items-center justify-center bg-dark text-white hover:bg-accent transition-colors cursor-pointer"
        aria-label="Copy link"
        type="button"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
    </div>
  );
}
