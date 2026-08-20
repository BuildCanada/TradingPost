import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ThemeShell from "@/components/ThemeShell";
import { Toaster } from "sonner";
import { SubscribeModal } from "@/components/subscribe";
import { IdentifyUser } from "@/components/auth/IdentifyUser";
import { HubspotTracking } from "@/components/HubspotTracking";
import { XPixel } from "@/components/XPixel";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: {
    default: "Build Canada",
    template: "%s | Build Canada",
  },
  description:
    "Bold thinking from builders, reformers, and leaders pushing Canada to new frontiers.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://buildcanada.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Build Canada",
    title: "Build Canada",
    description:
      "Bold thinking from builders, reformers, and leaders pushing Canada to new frontiers.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@buildcanada",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
      <body className="antialiased bg-[#E0E0E0] p-[10px]">
        <ThemeShell>
          <div className="fixed top-0 left-0 right-0 h-[10px] bg-bg z-40" />
          <ScrollToTop />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeShell>
        <Toaster position="bottom-right" />
        <SubscribeModal />
        <IdentifyUser />
        <HubspotTracking />
        <XPixel />
      </body>
    </html>
  );
}
