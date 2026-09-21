import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unauthorized",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function UnauthorizedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
