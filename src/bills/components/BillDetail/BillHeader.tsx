import type { UnifiedBill } from "@/bills/utils/billConverters";

interface BillHeaderProps {
  bill: UnifiedBill;
}

export function getParliament45Header() {
  return undefined;
}

export function BillHeader({ bill }: BillHeaderProps) {
  return (
    <header className="pb-4">
      <h1 className="mb-6 md:text-[48px] text-[32px] leading-8 md:leading-14 font-semibold">
        {bill.short_title}
      </h1>
      <p className="mt-2 text-sm  md:w-1/2">{bill.title}</p>
    </header>
  );
}
