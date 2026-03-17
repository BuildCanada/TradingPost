import SectionLabel from "@/components/SectionLabel";

function HeroBlock() {
  return (
    <section className="px-5 pt-[42px] pb-[52px] md:pt-[58px] md:pb-[68px] border-b border-[var(--color-border-light)]">
      <SectionLabel className="pb-2">Who We Are</SectionLabel>
      <h1 className="type-title mb-4 max-w-[700px]">
        Building a bolder Canada.
      </h1>
      <div className="max-w-[600px] space-y-2">
        <div className="h-[8px] bg-[var(--color-border-light)] rounded-sm w-[90%]" />
        <div className="h-[8px] bg-[var(--color-border-light)] rounded-sm w-[75%]" />
        <div className="h-[8px] bg-[var(--color-border-light)] rounded-sm w-[50%]" />
      </div>
    </section>
  );
}

function PlatformBlock() {
  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <SectionLabel>Our Platform</SectionLabel>
      <div className="grid grid-cols-2 gap-3 mt-2 max-w-[600px]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[72px] border border-[var(--color-border-light)] p-3 flex flex-col justify-end gap-1.5"
          >
            <div className="w-[18px] h-[18px] bg-[var(--color-border-light)] rounded" />
            <div className="h-[6px] bg-[var(--color-border-light)] rounded-sm w-[80%]" />
            <div className="h-[6px] bg-[var(--color-border-light)] rounded-sm w-[55%]" />
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamBlock() {
  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <SectionLabel>Team</SectionLabel>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-2 max-w-[600px]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-[52px] h-[52px] rounded-full bg-[var(--color-border-light)] border border-[var(--color-border-light)]" />
            <div className="h-[7px] bg-[var(--color-border-light)] rounded-sm w-[65%]" />
            <div className="h-[6px] bg-[var(--color-border-light)] rounded-sm w-[80%]" />
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsBlock() {
  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <SectionLabel>Testimonials</SectionLabel>
      <div className="border border-[var(--color-border-light)] mt-2 max-w-[600px]">
        <div className="p-5">
          <div className="space-y-2 mb-4">
            <div className="h-[7px] bg-[var(--color-border-light)] rounded-sm w-[95%]" />
            <div className="h-[7px] bg-[var(--color-border-light)] rounded-sm w-[80%]" />
            <div className="h-[7px] bg-[var(--color-border-light)] rounded-sm w-[60%]" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[28px] h-[28px] rounded-full bg-[var(--color-border-light)]" />
            <div>
              <div className="h-[6px] bg-[var(--color-border-light)] rounded-sm w-[70px] mb-1.5" />
              <div className="h-[6px] bg-[var(--color-border-light)] rounded-sm w-[50px]" />
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--color-border-light)] px-4 py-2.5 flex items-center justify-between">
          <div className="w-[28px] h-[28px] border border-[var(--color-border-light)] flex items-center justify-center text-[15px] text-[var(--color-text-muted)]">
            ‹
          </div>
          <div className="flex gap-1.5">
            <div className="w-[14px] h-[6px] rounded-full bg-[var(--color-dark)]" />
            <div className="w-[6px] h-[6px] rounded-full bg-[var(--color-border-light)]" />
            <div className="w-[6px] h-[6px] rounded-full bg-[var(--color-border-light)]" />
          </div>
          <div className="w-[28px] h-[28px] border border-[var(--color-border-light)] flex items-center justify-center text-[15px] text-[var(--color-text-muted)]">
            ›
          </div>
        </div>
      </div>
    </section>
  );
}

function QnaBlock() {
  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <SectionLabel>Q&amp;A</SectionLabel>
      <div className="max-w-[600px] mt-2">
        {[78, 65, 82, 55].map((w, i) => (
          <div
            key={i}
            className="py-3 border-b border-[var(--color-border-light)] last:border-b-0 flex items-center justify-between gap-3"
          >
            <div
              className="h-[8px] bg-[var(--color-dark)] rounded-sm"
              style={{ width: `${w}%` }}
            />
            <div className="w-[18px] h-[18px] border border-[var(--color-border-light)] flex items-center justify-center text-[12px] text-[var(--color-text-muted)] shrink-0">
              {i === 0 ? "−" : "+"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)]">
      <HeroBlock />
      <PlatformBlock />
      <TeamBlock />
      <TestimonialsBlock />
      <QnaBlock />
    </div>
  );
}
