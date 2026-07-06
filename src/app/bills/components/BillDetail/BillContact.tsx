import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";

interface BillContactProps {
  className?: string;
}

export function BillContact({ className }: BillContactProps) {
  return (
    <Card className={cn("bg-white", className)}>
      <CardContent className="space-y-2 text-sm p-4 md:p-6">
        <p className="font-medium text-dark">
          Did we get the builder vote wrong?
        </p>
        <p className="text-text-secondary">
          Email{" "}
          <a
            href="mailto:hi@buildcanada.com"
            className="underline underline-offset-2 hover:text-dark transition-colors"
          >
            hi@buildcanada.com
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
