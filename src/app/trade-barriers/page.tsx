import {
  fetchAgreements,
  fetchJurisdictions,
  fetchThemes,
} from "@/lib/api/trade-barriers";
import TradeBarriersPage from "@/components/trade-barriers/TradeBarriersPage";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function Page() {
  const [agreements, jurisdictions, themes] = await Promise.all([
    fetchAgreements(),
    fetchJurisdictions(),
    fetchThemes(),
  ]);

  return (
    <TradeBarriersPage
      initialAgreements={agreements}
      jurisdictions={jurisdictions}
      themes={themes}
    />
  );
}
