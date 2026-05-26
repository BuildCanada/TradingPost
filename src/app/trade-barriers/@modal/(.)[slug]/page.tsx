import { notFound } from "next/navigation";
import { fetchAgreement } from "@/lib/api/trade-barriers";
import AgreementModal from "@/components/trade-barriers/AgreementModal";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agreement = await fetchAgreement(slug);
  if (!agreement) notFound();

  return <AgreementModal agreement={agreement} />;
}
