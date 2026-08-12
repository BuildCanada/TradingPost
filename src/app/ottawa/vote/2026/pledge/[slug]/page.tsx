import type { Metadata } from "next";
import { resolvePledgeName } from "@/lib/elections/pledge-record";
import SharedPledgeClient from "./SharedPledgeClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ n?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { n } = await searchParams;
  const name = await resolvePledgeName("ottawa-2026", slug, n);
  return {
    title: `${name} pledged to vote — Ottawa 2026`,
    description: `${name} is on the record for Ottawa's 2026 municipal election, Monday, October 26. Will you be?`,
    openGraph: {
      title: `${name} pledged to vote — Ottawa 2026 | Build Canada`,
      description: `${name} pledged to vote in Ottawa's 2026 municipal election on October 26, 2026. Join them on the record.`,
      type: "website",
    },
  };
}

export default async function SharedPledgePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { n } = await searchParams;
  return (
    <SharedPledgeClient
      name={await resolvePledgeName("ottawa-2026", slug, n)}
    />
  );
}
