import { DASHBOARD_SECTIONS } from "./dashboard";

// Anchor nav for the single-page dashboard. Sits below the global navbar
// (~70px) in the sticky stack, mirroring SectionNav on the subpages.
export default function DashboardNav() {
  return (
    <nav
      aria-label="Dashboard sections"
      className="sticky top-[70px] z-40 border-b border-border-light bg-bg px-5 py-3"
    >
      <div className="max-w-[1080px] mx-auto flex flex-wrap gap-x-6 gap-y-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DASHBOARD_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="type-label text-dark/60 hover:text-dark underline-offset-4 hover:underline whitespace-nowrap"
          >
            {section.title}
          </a>
        ))}
      </div>
    </nav>
  );
}
