import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Build Canada",
  description:
    "Build Canada exists to platform the bold — individuals, ideas, and reforms — that can push our country to new frontiers.",
  openGraph: {
    title: "About | Build Canada",
    description:
      "Build Canada exists to platform the bold — individuals, ideas, and reforms — that can push our country to new frontiers.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About | Build Canada",
    description:
      "Build Canada exists to platform the bold.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
