import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAgreement } from "@/lib/api/trade-barriers";
import AgreementDetail from "@/components/trade-barriers/AgreementDetail";

export const dynamic = "force-dynamic";
export const revalidate = 300;

interface Params {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agreement = await fetchAgreement(slug);
  if (!agreement) return { title: "Not found" };

  const description =
    agreement.summary?.slice(0, 200) ?? "Interprovincial trade agreement";
  const url = `https://www.buildcanada.com/trade-barriers/${slug}`;

  return {
    title: agreement.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: agreement.title,
      description,
      url,
      images: ["/trade-barriers/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: agreement.title,
      description,
      images: ["/trade-barriers/og.png"],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const agreement = await fetchAgreement(slug);
  if (!agreement) notFound();

  return (
    <div className="min-h-screen bg-stone-50">
      <AgreementDetail agreement={agreement} />
    </div>
  );
}
