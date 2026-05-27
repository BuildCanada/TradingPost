import type { Metadata } from "next";
import SWRProvider from "@/components/tracker/SWRProvider";
import { Sidebar } from "@/components/tracker/Sidebar";

const title = "Outcomes Tracker - Build Canada";
const description = "Track the progress of Canada's government initiatives";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tracker" },
  icons: {
    icon: "/tracker/buildcanada-logo-square.svg",
    apple: "/tracker/buildcanada-logo-square.svg",
  },
  openGraph: {
    title,
    description,
    images: [
      {
        url: "/tracker/outcomes-tracker-seo-image.png",
        width: 1200,
        height: 630,
        alt: "Build Canada Outcomes Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function TrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRProvider>
      <div className="tracker-root bg-[#f6ebe3] text-neutral-800 max-[385px]:px-1 px-2 py-3 lg:px-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-6">
          <Sidebar pageTitle="Outcomes Tracker" />
          <div className="col-span-3">{children}</div>
        </div>
      </div>
    </SWRProvider>
  );
}
