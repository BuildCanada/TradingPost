import Image from "next/image";
import SectionLabel from "@/components/SectionLabel";
import type { TeamMember } from "./types";

const roleGroups = [
  { key: "CORE", label: "Core Team" },
  { key: "BOARD", label: "Board" },
  { key: "ADVISOR", label: "Advisors" },
] as const;

function TeamMemberCard({ m }: { m: TeamMember }) {
  return (
    <div className="flex flex-col items-center border border-border-light -ml-px -mt-px p-6">
      <div className="flex flex-col items-start gap-1">
      {m.photo ? (
        <Image
          src={m.photo}
          alt={m.name}
          width={160}
          height={160}
          className="w-[160px] h-[160px] object-cover border border-border-light mb-2"
        />
      ) : (
        <div className="w-[160px] h-[160px] bg-border-light/30 border border-border-light mb-2 flex items-center justify-center">
          <div className="w-[64px] h-[64px] opacity-20" style={{ backgroundColor: "currentColor", maskImage: "url(/assets/icons/newmapleleaf.svg)", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center", WebkitMaskImage: "url(/assets/icons/newmapleleaf.svg)", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }} />
        </div>
      )}
      <div>
        <p className="type-h4 leading-tight">{m.name}</p>
        <p className="type-body-sm text-text-secondary mt-0.5">{m.title}</p>
      </div>
      {(m.xUrl || m.linkedinUrl) && (
        <div className="flex items-center gap-0.5">
          {m.xUrl && (
            <a
              href={m.xUrl}
              target="_blank"
              rel="noopener noreferrer"
               className="w-12 h-12 flex items-center justify-center hover:opacity-70 transition-opacity"
             >
               <Image
                 src="/assets/icons/platform-x-twitter.svg"
                 alt="X"
                 width={12}
                 height={12}
                 className="brightness-0 opacity-50"
               />
             </a>
           )}
           {m.linkedinUrl && (
             <a
               href={m.linkedinUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="w-12 h-12 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-50">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
              </svg>
            </a>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default function TeamBlock({ members }: { members: TeamMember[] }) {
  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2">Team</SectionLabel>
        <div className="mt-4 space-y-10">
          {roleGroups.map(({ key, label }) => {
            const group = members.filter((m) => (m.role || "CORE") === key);
            if (group.length === 0) return null;
            return (
              <div key={key}>
                <h3 className="type-label text-text-secondary mb-4">{label}</h3>
                <div className="flex flex-wrap pl-px pt-px">
                  {group.map((m) => (
                    <div
                      key={m.id}
                      className="basis-1/2 sm:basis-1/3 lg:basis-1/4 flex-grow"
                    >
                      <TeamMemberCard m={m} />
                    </div>
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
