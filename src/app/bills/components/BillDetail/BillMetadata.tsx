import type { UnifiedBill } from "@/app/bills/utils/billConverters";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getBillStageDates } from "@/app/bills/utils/stages-to-dates/stages-to-dates";
import { formatBillDate } from "@/app/bills/utils/format-date";

interface BillMetadataProps {
  bill: UnifiedBill;
}

const DataPoint = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex text-sm items-start justify-between py-1">
      <span className="">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
};

export function BillMetadata({ bill }: BillMetadataProps) {
  const billDates = getBillStageDates(bill.stages);
  const lastUpdatedDate = formatBillDate(billDates.lastUpdated);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <a
            href={`https://www.parl.ca/LegisInfo/en/bill/45-1/${bill.billId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-md font-bold underline text-accent hover:no-underline"
          >
            {bill.billId}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <DataPoint
          label="Party"
          value={
            bill.chamber === "Senate"
              ? "Senate"
              : bill.sponsorParty || "Unknown"
          }
        />
        <DataPoint label="Status" value={bill.status} />
        {/* {bill.introducedOn && (
          <DataPoint label="Introduced" value={introducedDate} />
        )} */}
        {bill.lastUpdatedOn && (
          <DataPoint label="Last updated" value={lastUpdatedDate} />
        )}
        {bill.genres && bill.genres.length > 0 && (
          <DataPoint label="Topics" value={bill.genres.join(", ")} />
        )}
        {bill.parliamentNumber && bill.sessionNumber && (
          <DataPoint label="Parliament" value={`${bill.parliamentNumber}`} />
        )}
      </CardContent>
    </Card>
  );
}
