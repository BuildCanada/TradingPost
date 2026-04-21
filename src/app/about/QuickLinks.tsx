interface QuickLink {
  label: string;
  href: string;
}

export default function QuickLinks({ links }: { links: QuickLink[] }) {
  return (
    <div className="px-6 sm:px-16 border-b border-border-light overflow-x-auto scrollbar-none">
      <div className="max-w-screen-2xl mx-auto flex gap-6">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="type-label whitespace-nowrap py-4 transition-colors text-text-secondary hover:text-dark"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
