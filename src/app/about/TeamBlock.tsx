import { PersonCard } from "@/components/ui/person-card";
import type { Person } from "./types";

const roleGroups = [
  { key: "CORE", label: "Core Team", id: "core-team" },
  { key: "BOARD", label: "Board", id: "board" },
  { key: "MEMO_AUTHOR", label: "Memo Authors", id: "memo-authors" },
] as const;

export default function TeamBlock({ members }: { members: Person[] }) {
  return (
    <section className="px-6 sm:px-16 py-12 border-b border-border-light">
      <div className="max-w-screen-2xl mx-auto">
        <div className="space-y-16">
          {roleGroups.map(({ key, label, id }) => {
            const group = members
              .filter((m) => (m.role || "CORE") === key)
              .sort((a, b) => a.name.localeCompare(b.name));
            if (group.length === 0) return null;
            return (
              <div key={key} id={id}>
                <h3 className="type-h2 text-dark mb-12">{label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {group.map((m) => (
                    <PersonCard
                        key={m.id}
                        name={m.name}
                        title={m.title}
                        photo={m.photo}
                        xUrl={m.xUrl}
                        linkedinUrl={m.linkedinUrl}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
