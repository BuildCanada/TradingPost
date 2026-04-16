import SectionLabel from "@/components/SectionLabel";

export default function CrisisBlock() {
  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2">The State of Canada</SectionLabel>
        <h2 className="type-h3 text-dark mt-2 mb-4">We were falling behind.</h2>
        <p className="type-body text-dark leading-relaxed max-w-[700px]">
          Canada&apos;s productivity is declining. GDP per capita is slipping. Investment is leaving, talent is departing, and the old playbook isn&apos;t working. The data speaks for itself.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/productivity-growth-by-country-oecd.webp"
              alt="Bar chart showing OECD productivity growth by country from 2019 to 2024, with Canada ranking near the bottom at less than 0.5 percent"
              className="w-full border border-border-light"
            />
            <p className="type-label-sm text-text-secondary mt-1">Source:{" "}
              <a
                href="https://data.oecd.org/lprdty/gdp-per-hour-worked.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent transition-colors"
              >
                OECD
              </a>
            </p>
          </div>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/canada-falling-standard-of-living.webp"
              alt="Line chart comparing Canada and U.S. real GDP per capita from 2016 to 2023, showing Canada's standard of living falling behind"
              className="w-full border border-border-light"
            />
            <p className="type-label-sm text-text-secondary mt-1">Source:{" "}
              <a
                href="https://www.theglobeandmail.com/business/commentary/article-cost-of-living-crisis-data-perception/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent transition-colors"
              >
                The Globe and Mail
              </a>
              , NBF Economics and Strategy
            </p>
          </div>
        </div>

        <blockquote className="mt-8 pl-5 border-l-2 border-accent max-w-[700px]">
          <p className="type-body text-dark leading-relaxed italic">
            Build Canada started because a group of founders looked at the data — falling productivity, declining investment, rising brain drain — and decided to stop waiting for someone else to fix it.
          </p>
        </blockquote>
      </div>
    </section>
  );
}
