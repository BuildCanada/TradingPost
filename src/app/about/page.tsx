import { fetchFaqs, fetchTeamMembers, fetchTestimonials, getSiteConfig } from "@/lib/api";
import SectionLabel from "@/components/SectionLabel";
import CrisisBlock from "./CrisisBlock";
import ImpactBlock from "./ImpactBlock";
import PlatformBlock from "./PlatformBlock";
import TeamBlock from "./TeamBlock";
import TestimonialsBlock from "@/components/TestimonialsBlock";
import QnaBlock from "./QnaBlock";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateFAQPageSchema } from "@/lib/schemas/generators/faq-page";
import { generateReviewSchema } from "@/lib/schemas/generators/review";

export default async function AboutPage() {
  const [people, testimonials, qandaItems] = await Promise.all([
    fetchTeamMembers("team"),
    fetchTestimonials(),
    fetchFaqs(),
  ]);

  const configData = getSiteConfig();

  const orgSchema = generateOrganizationSchema(configData);
  const faqSchema = generateFAQPageSchema(
    qandaItems.map((item) => ({ question: item.question, answer: item.answer }))
  );
  const reviewSchemas = testimonials.map((t) =>
    generateReviewSchema(
      {
        name: t.name,
        quote: t.quote,
        title: t.title,
        profilePhoto: t.profilePhoto,
        person: null,
      },
      configData
    )
  );

  const jsonLd = buildGraph(orgSchema, faqSchema, ...reviewSchemas);

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="px-5 pt-[120px] pb-[100px] md:pt-[140px] md:pb-[120px] border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel as="h2">Who We Are</SectionLabel>
          <h1 className="type-display mt-4 mb-6 max-w-[700px] text-dark" style={{ letterSpacing: "-0.126rem" }}>
            Canada is worth building.
          </h1>
          <p className="type-body max-w-[600px] text-dark/70">
            Build Canada publishes bold policy research and builds transparency tools to make Canada the most prosperous country in the world.
          </p>
        </div>
      </section>
      <CrisisBlock />
      <ImpactBlock />
      <PlatformBlock />
      <TeamBlock members={people} />
      <TestimonialsBlock testimonials={testimonials} />
      <QnaBlock items={qandaItems} />
    </div>
  );
}
