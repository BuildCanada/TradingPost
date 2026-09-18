import React from "react";
import type { UnifiedBill } from "@/app/bills/utils/billConverters";
import { Markdown } from "../Markdown/markdown";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface BillSteelManProps {
  bill: UnifiedBill;
}

/**
 * The strongest good-faith case against the verdict this page just gave.
 *
 * The field has existed on the model and the admin edit form since the start,
 * but nothing generated it and nothing rendered it. A tool that issues verdicts
 * on legislation is more credible for showing its own best counter-argument.
 */
export function BillSteelMan({ bill }: BillSteelManProps) {
  const steelMan = bill.steel_man?.trim();
  if (!steelMan) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>The other side</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-text-secondary">
          The strongest case against this judgement.
        </p>
        <Markdown>{steelMan}</Markdown>
      </CardContent>
    </Card>
  );
}
