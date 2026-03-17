export default function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`type-label text-[var(--color-text-secondary)] block pb-1 ${className}`}
    >
      {children}
    </span>
  );
}
