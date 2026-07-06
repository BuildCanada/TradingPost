import type { Metadata } from "next";
import { SessionProvider } from "@/app/bills/components/SessionProvider";
import {
  BUILD_CANADA_TWITTER_HANDLE,
  PROJECT_NAME,
} from "@/app/bills/consts/general";

// Nested layout for the ported BillsTracker sub-app. The root layout
// (src/app/layout.tsx) already owns <html>/<body>, the shared TradingPost
// Navbar/Footer, the Toaster and analytics — so this layout only adds the
// NextAuth session context and the `.bills-scope` wrapper that applies
// BillsTracker's (scoped) theme tokens from src/app/bills/bills.css.
export const metadata: Metadata = {
  title: {
    default: PROJECT_NAME,
    template: `%s · ${PROJECT_NAME}`,
  },
  description: "Understand Canadian Federal Bills",
  openGraph: {
    type: "website",
    siteName: PROJECT_NAME,
    title: PROJECT_NAME,
    description: "Understand Canadian federal bills through a builder's lens",
    url: "/bills",
    images: [
      {
        url: "https://buildcanada.com/bills/builder-mp-seo-image.png",
        width: 1200,
        height: 630,
        alt: "Builder MP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: BUILD_CANADA_TWITTER_HANDLE,
    creator: BUILD_CANADA_TWITTER_HANDLE,
    title: PROJECT_NAME,
    description: "Understand Canadian Federal Bills",
    images: ["https://buildcanada.com/bills/builder-mp-seo-image.png"],
  },
};

export default function BillsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <div className="bills-scope">{children}</div>
    </SessionProvider>
  );
}
