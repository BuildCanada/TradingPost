import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import CanvasClient from "./CanvasClient";

const DESCRIPTION =
  "Overlay up to three economic indicator series and eyeball how they move together.";

export const metadata: Metadata = {
  title: "Indicator Canvas",
  description: DESCRIPTION,
  alternates: { canonical: "/prosperity-dashboard/canvas" },
  openGraph: {
    title: "Indicator Canvas",
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indicator Canvas",
  },
};

export default function CanvasPage() {
  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <PageHeader
        title="Indicator Canvas"
        description="Pick up to three data feeds and overlay them to see how they move together."
      />

      <nav className="border-b border-border-light px-5 py-3">
        <div className="max-w-[1080px] mx-auto">
          <Link
            href="/prosperity-dashboard"
            className="type-label text-dark/70 hover:text-dark underline-offset-4 hover:underline"
          >
            &larr; Prosperity Dashboard
          </Link>
        </div>
      </nav>

      <section className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto">
          <Suspense>
            <CanvasClient />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
