import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "🏗️ Toronto",
    template: "%s | 🏗️ Toronto",
  },
  description:
    "Memos and ideas for Toronto — a publication of Build Canada.",
};

export default function TorontoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="theme-toronto">{children}</div>;
}
