import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Trade Barriers Tracker · Build Canada",
    template: "%s · Build Canada Trade Barriers",
  },
  description:
    "Tracking progress of interprovincial trade agreements across Canada — agreements between provinces and territories that reduce barriers to trade and labour mobility.",
  openGraph: {
    type: "website",
    title: "Trade Barriers Tracker · Build Canada",
    description:
      "Tracking progress of interprovincial trade agreements across Canada.",
    images: ["/trade-barriers/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trade Barriers Tracker · Build Canada",
    description:
      "Tracking progress of interprovincial trade agreements across Canada.",
    images: ["/trade-barriers/og.png"],
  },
};

export default function TradeBarriersLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
