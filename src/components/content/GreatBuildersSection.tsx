import SectionLabel from "@/components/SectionLabel";
import GreatBuildersWidget from "@/components/widgets/GreatBuildersWidget";

const BUILDERS_PROJECT = {
  id: "great-builders",
  slug: "great_builders",
  title: "Great Canadian Builders",
  description:
    "Read short stories celebrating the incredible builders who shaped Canada.",
  externalUrl: "",
  size: "big" as const,
  featured: false,
  order: 0,
  accentColor: null,
};

export function GreatBuildersSection() {
  return (
    <section className="px-5 py-12 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2">Great Canadian Builders</SectionLabel>
        <div className="border border-border-light">
          <GreatBuildersWidget project={BUILDERS_PROJECT} />
        </div>
      </div>
    </section>
  );
}
