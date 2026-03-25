import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content",
  description:
    "Follow Build Canada across all platforms. Aggregated posts from X, TikTok, Instagram, Substack, and more.",
  openGraph: {
    title: "Content",
    description:
      "Follow Build Canada across all platforms.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Content",
    description:
      "Follow Build Canada across all platforms.",
  },
};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
