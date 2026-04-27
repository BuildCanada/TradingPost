type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <section className="px-5 pt-10 pb-6 md:pt-12 md:pb-8 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <h1 className="type-h2 mb-1 text-dark">{title}</h1>
        {description && (
          <p className="type-body text-dark/70">{description}</p>
        )}
      </div>
    </section>
  );
}
