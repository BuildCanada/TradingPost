import type { Metadata } from "next";
import { ExitIntentHandler } from "@/components/subscribe";

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
  return (
    <div className="theme-toronto bg-bg">
      {/* Exit intent across the whole Toronto section — the memos, the
          election tracker, the ward pages and the guides — rather than the
          root homepage alone, where it was the only thing mounting it.

          Mounted on the layout, not the pages, so the listener survives
          client-side navigation within /toronto: someone who reads three ward
          pages gets asked at most once, not once per page. It renders nothing
          and only listens; the modal itself lives in the root layout. */}
      <ExitIntentHandler />
      {children}
    </div>
  );
}
