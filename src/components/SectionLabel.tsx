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
    <Tag className={`type-h2 block ${className}`}>
      {children}
    </Tag>
  );
}
