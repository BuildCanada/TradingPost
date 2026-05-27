import { fetchFaqs, fetchTeamMembers, getSiteConfig } from "@/lib/api";
import TeamBlock from "./TeamBlock";
import QnaBlock from "./QnaBlock";
import QuickLinks from "./QuickLinks";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateFAQPageSchema } from "@/lib/schemas/generators/faq-page";

const quickLinks = [
  { label: "Core Team", href: "#core-team" },
  { label: "Board", href: "#board" },
  { label: "FAQs", href: "#faqs" },
];

export default async function AboutPage() {
  const [people, qandaItems] = await Promise.all([
    fetchTeamMembers(),
    fetchFaqs(),
  ]);

  const configData = getSiteConfig();

  const orgSchema = generateOrganizationSchema(configData);
  const faqSchema = generateFAQPageSchema(
    qandaItems.map((item) => ({ question: item.question, answer: item.answer }))
  );

  const jsonLd = buildGraph(orgSchema, faqSchema);

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="px-6 sm:px-16 py-12 border-b border-border-light">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-x-12 items-stretch">
          <div className="md:pr-12 md:border-r md:border-border-light flex md:items-center">
            <h1 className="type-display text-dark" style={{ letterSpacing: "-0.126rem" }}>
              Canada can be the most prosperous country on earth
            </h1>
          </div>
          <div className="mt-6 md:mt-0">
            <div className="type-body text-dark/70 space-y-4">
              <p>
                Canada isn&rsquo;t something we found. Nor was it something we were given. It was something that was built, by successive waves and generations of people with ideas, energy, and ambition for what this country could be. But in recent years that energy has been lost. At some point, we started to take Canada and our standard of living for granted. And now we are starting to feel the effects of lowered expectations.
              </p>
              <p>
                We love this country. We believe we have the talent, resources, and potential to become the most prosperous country in the world. But we are not content to stand by and watch our nation&rsquo;s decline. We believe Canada can grow &ndash; fast and fearlessly.
              </p>
            </div>
          </div>
        </div>
      </section>
      <QuickLinks links={quickLinks} />
      <TeamBlock members={people} />
      <QnaBlock items={qandaItems} />
    </div>
  );
}
