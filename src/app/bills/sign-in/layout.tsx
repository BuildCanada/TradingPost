import type { Metadata } from "next";

// Auth pages must never be indexed — they were outranking the bills listing
// for "Builder MP" because they inherited the layout's default title.
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function SignInLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
