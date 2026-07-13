import Link from "next/link";
import { SECTIONS } from "./indicators";

// Sits below the global navbar (~70px) in the sticky stack.
export default function SectionNav({ currentId }: { currentId?: string }) {
  return (
    <nav
      aria-label="Indicator sections"
      className="sticky top-[70px] z-40 border-b border-border-light bg-bg px-5 py-3"
    >
      <div className="max-w-[1080px] mx-auto flex flex-wrap gap-x-6 gap-y-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/prosperity-dashboard"
          aria-current={currentId === undefined ? "page" : undefined}
          className={
            currentId === undefined
              ? "type-label text-accent underline underline-offset-4 whitespace-nowrap"
              : "type-label text-dark/60 hover:text-dark underline-offset-4 hover:underline whitespace-nowrap"
          }
        >
          Overview
        </Link>
        {SECTIONS.map((section) => {
          const isActive = section.id === currentId;
          return (
            <Link
              key={section.id}
              href={`/prosperity-dashboard/${section.id}`}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "type-label text-accent underline underline-offset-4 whitespace-nowrap"
                  : "type-label text-dark/60 hover:text-dark underline-offset-4 hover:underline whitespace-nowrap"
              }
            >
              {section.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
