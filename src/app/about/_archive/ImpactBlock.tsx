import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";

const stats = [
  { value: "$4.5B", label: "program reformed" },
  { value: "2x", label: "expenditure limit raised" },
  { value: "AI-powered", label: "audits replace consultant drag" },
];

export default function ImpactBlock() {
  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2">Proof of Impact</SectionLabel>
        <h2 className="type-h3 text-dark mt-2 mb-4">A memo changed federal policy.</h2>

        <div className="max-w-[700px] space-y-4">
          <p className="type-body text-dark leading-relaxed">
            In July 2025, the Federal Government approached Shopify seeking input on SR&amp;ED reforms. Shopify President Harley Finkelstein had already published a memo on Build Canada criticizing the program&apos;s complexity.
          </p>
          <p className="type-body text-dark leading-relaxed">
            Shopify returned a complete SR&amp;ED redesign based on Harley&apos;s Build Canada memo — in 48 hours.
          </p>
        </div>

        <div className="mt-6 max-w-[480px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/shopify-sred-policy-reform-article.webp"
            alt="Canadian Press article headline: Shopify helps feds with key piece of budget policy on SR&ED reform"
            className="w-full border border-border-light"
          />
          <p className="type-label-sm text-text-secondary mt-1">Source:{" "}
            <a
              href="https://www.thecanadianpressnews.ca/national/ottawa-is-rebooting-its-relationship-with-the-tech-industry-advocates-say/article_38f627a3-3087-58a1-bb49-aeeb1993582e.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent transition-colors"
            >
              The Canadian Press
            </a>
            , Nov 2025
          </p>
        </div>

        <blockquote className="mt-6 pl-5 border-l-2 border-accent max-w-[700px]">
          <p className="type-body text-dark leading-relaxed italic">
            &ldquo;We went to Shopify and said, &apos;Can you help us redesign this process?&apos; Somewhat embarrassingly, they came back in 48 hours and said, &apos;Do this.&apos;&rdquo;
          </p>
          <footer className="mt-2 type-label-sm text-text-secondary">
            — Prime Minister Mark Carney
          </footer>
        </blockquote>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[700px]">
          {stats.map((stat) => (
            <div key={stat.value} className="border border-border-light p-4 flex flex-col items-center text-center">
              <span className="type-h3 text-accent">{stat.value}</span>
              <span className="type-label-sm text-text-secondary mt-1">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 max-w-[700px] space-y-4">
          <p className="type-body text-dark leading-relaxed">
            Budget 2025 included sweeping SR&amp;ED reforms — upfront funding approval, doubled annual limits to $6 million, and AI-powered audits to cut bureaucratic burden. A program bogged down by consultants absorbing 25–33% of every dollar was finally getting fixed.
          </p>
          <p className="type-body text-dark leading-relaxed">
            And it started with a Build Canada memo.
          </p>
        </div>

        <div className="mt-6 max-w-[480px]">
          <Link
            href="/memos/fix-sred"
            className="border border-border-light p-3 flex flex-col gap-1.5 group hover:bg-border-light/20 transition-colors"
          >
            <h4 className="type-caption font-sans font-medium tracking-tight group-hover:text-accent transition-colors line-clamp-2" style={{ lineHeight: 1.1 }}>
              Fix Canada&apos;s Primary R&amp;D Program
            </h4>
            <p className="type-label-sm text-text-secondary">
              Harley Finkelstein
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
