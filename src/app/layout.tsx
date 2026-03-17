import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Build Canada",
    template: "%s",
  },
  description: "Canada's Voice for Builders. Bold thinking from builders, reformers, and leaders pushing Canada to new frontiers.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://buildcanada.ca"),
  openGraph: {
    type: "website",
    siteName: "Build Canada",
    title: "Build Canada",
    description: "Canada's Voice for Builders.",
  },
  twitter: {
    card: "summary",
    site: "@build_canada",
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
      <body className="antialiased bg-[#E0E0E0] p-[10px]">
        <div className="fixed top-0 left-0 right-0 h-[10px] bg-[var(--color-bg)] z-40" />
        <div className="bg-[var(--color-bg)] border-x-2 border-b-2 border-[var(--color-border)]">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
