import type { UnifiedBill } from "@/app/bills/utils/billConverters";

interface BillHeaderProps {
  bill: UnifiedBill;
}

export function getParliament45Header() {
  return undefined;
}

export function BillHeader({ bill }: BillHeaderProps) {
  return (
    <header className="pb-4">
      <h1 className="mb-6 type-title text-dark">{bill.short_title}</h1>
      <p className="mt-2 type-body text-text-secondary md:w-1/2">{bill.title}</p>
    </header>
  );
}
