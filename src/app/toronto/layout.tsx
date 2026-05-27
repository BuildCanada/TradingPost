import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Build Canada - Toronto",
    template: "%s | Build Canada - Toronto",
  },
  description:
    "Memos and ideas for Toronto — a publication of Build Canada.",
};

export default function TorontoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="theme-toronto bg-bg">{children}</div>;
}
