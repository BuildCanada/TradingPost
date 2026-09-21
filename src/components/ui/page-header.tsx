type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional trailing control (a link, a dialog trigger) shown beside the title. */
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <section className="px-5 pt-10 pb-6 md:pt-12 md:pb-8 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto flex items-start justify-between gap-6">
        <div>
          <h1 className="type-h2 mb-1 text-dark">{title}</h1>
          {description && (
            <p className="type-body text-dark/70">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0 pt-1">{action}</div>}
      </div>
    </section>
  );
}
