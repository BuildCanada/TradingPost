import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed",
  description:
    "Follow Build Canada across all platforms. Aggregated posts from X, TikTok, Instagram, Substack, and more.",
  openGraph: {
    title: "Feed",
    description:
      "Follow Build Canada across all platforms.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Feed",
    description:
      "Follow Build Canada across all platforms.",
  },
};

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
