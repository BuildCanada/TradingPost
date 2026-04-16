import SectionLabel from "@/components/SectionLabel";

type SectionHeaderProps = {
  label: string;
  action?: React.ReactNode;
};

export function SectionHeader({ label, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <SectionLabel>{label}</SectionLabel>
      {action && (
        <div className="hidden compact:flex">
          {action}
        </div>
      )}
    </div>
  );
}
