import SectionLabel from "@/components/SectionLabel";

const principles = [
  {
    title: "Prosperous",
    oneLiner: "An economy where starting a business is simple, growing one is possible, and success is celebrated.",
    paragraph:
      "We stand for lower regulatory burden, competitive taxation, faster permitting, and a government that sees enterprise as the engine of national prosperity — not a resource to be extracted from.",
  },
  {
    title: "Fast",
    oneLiner: "Impatient with decline when builders have all the right tools to help Canada succeed.",
    paragraph:
      "The countries that move fastest on policy, permits, and delivery will win the next decade. We must remove the obstacles — bureaucratic, regulatory, and cultural — that have turned Canada into a country where it takes years to accomplish what should take months.",
  },
  {
    title: "Free",
    oneLiner: "Free markets, merit-based systems, and a fair starting line for every Canadian builder.",
    paragraph:
      "Canada thrives when markets are open, competition is real, and merit is the standard. We champion the removal of genuine barriers while preserving the rewards that flow from effort and ability. The question is always the same: Can you do the work?",
  },
  {
    title: "Sovereign",
    oneLiner: "Own our supply chains, defend our borders, and build for Canadians.",
    paragraph:
      "No one can beat you when ambition translates to excellence. This country was built with intention and it will continue as such. We believe we must build to get ahead.",
  },
];

export default function PlatformBlock() {
  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2">Our Principles</SectionLabel>
        <h2 className="type-h3 text-dark mt-2 mb-1">Builders believe Canada should be...</h2>
        <div className="mt-8 space-y-8">
          {principles.map((p) => (
            <div key={p.title}>
              <h3 className="type-h2 text-accent">{p.title}</h3>
              <p className="type-body text-dark/70 mt-1 max-w-[600px]">{p.oneLiner}</p>
              <p className="type-body text-dark leading-relaxed mt-3 max-w-[700px]">{p.paragraph}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
