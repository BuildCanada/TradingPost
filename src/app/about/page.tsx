import { fetchFaqs, fetchTeamMembers, getSiteConfig } from "@/lib/api";
import SectionLabel from "@/components/SectionLabel";
import { Button } from "@/components/ui/button";
import TeamBlock from "./TeamBlock";
import QnaBlock from "./QnaBlock";
import QuickLinks from "./QuickLinks";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateFAQPageSchema } from "@/lib/schemas/generators/faq-page";

const quickLinks = [
  { label: "Core Team", href: "#core-team" },
  { label: "Board", href: "#board" },
  { label: "Memo Authors", href: "#memo-authors" },
  { label: "Q&A", href: "#q-and-a" },
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
      <section className="px-6 sm:px-16 pt-32 pb-10 sm:pb-16 border-b border-border-light">
        <div className="max-w-screen-2xl mx-auto">
          <SectionLabel as="h2">Who We Are</SectionLabel>
          <h1 className="type-display mt-4 mb-6 text-dark" style={{ letterSpacing: "-0.126rem" }}>
            Canada is worth building.
          </h1>
          <p className="type-body max-w-[600px] text-dark/70">
            Build Canada publishes bold policy research and builds transparency tools to make Canada the most prosperous country in the world.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <Button href="/memos/build-canada-founding-memo">Read the Founding Memo</Button>
            <Button href="#">Read our Constitution</Button>
          </div>
        </div>
      </section>
      <QuickLinks links={quickLinks} />
      <TeamBlock members={people} />
      <QnaBlock items={qandaItems} />
    </div>
  );
}
