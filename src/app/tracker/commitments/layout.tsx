import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commitments - Outcomes Tracker - Build Canada",
  description:
    "Browse and search every tracked commitment from Canada's federal government, with status and progress updates.",
  alternates: { canonical: "/tracker/commitments" },
};

export default function CommitmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
