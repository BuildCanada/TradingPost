type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "h2" | "h3" | "h4";
};

export default function SectionLabel({
  children,
  className = "",
  as: Tag = "span",
}: SectionLabelProps) {
  return (
    <Tag
      className={`type-label font-bold text-[var(--color-text-secondary)] block m-0 pb-1 ${className}`}
    >
      {children}
    </Tag>
  );
}
