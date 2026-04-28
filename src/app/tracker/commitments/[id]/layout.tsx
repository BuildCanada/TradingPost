import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commitment - Outcomes Tracker - Build Canada",
  description:
    "Detailed status, sources, and assessments for a tracked federal commitment.",
};

export default function CommitmentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
