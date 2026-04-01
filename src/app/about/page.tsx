import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SectionLabel from "@/components/SectionLabel";
import OurStoryBlock from "./OurStoryBlock";
import PlatformBlock from "./PlatformBlock";
import TeamBlock from "./TeamBlock";
import TestimonialsBlock from "@/components/TestimonialsBlock";
import QnaBlock from "./QnaBlock";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateFAQPageSchema } from "@/lib/schemas/generators/faq-page";
import { generateReviewSchema } from "@/lib/schemas/generators/review";

export const dynamic = "force-dynamic";

async function getSiteConfig() {
  let config = await prisma.siteConfig.findUnique({ where: { id: "site" } });
  if (!config) {
    config = await prisma.siteConfig.create({ data: { id: "site" } });
  }
  return config;
}

export default async function AboutPage() {
  const [people, testimonials, qandaItems, siteConfig] = await Promise.all([
    prisma.person.findMany({ orderBy: { order: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { order: "asc" }, include: { person: true } }),
    prisma.qandAItem.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    getSiteConfig(),
  ]);

  const configData = {
    orgName: siteConfig.orgName,
    orgDescription: siteConfig.orgDescription,
    siteUrl: siteConfig.siteUrl,
    logoUrl: siteConfig.logoUrl,
    socialLinks: siteConfig.socialLinks,
  };

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
        person: t.person
          ? { name: t.person.name, title: t.person.title, photo: t.person.photo, bio: t.person.bio, websiteUrl: t.person.websiteUrl, xUrl: t.person.xUrl, linkedinUrl: t.person.linkedinUrl }
          : null,
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
      <section className="relative px-5 h-[45svh] md:h-[65svh] flex items-center border-b border-border-light overflow-hidden bg-[#3a3a3a]">
        <Image
          src="/assets/images/canadian-pacific-railway-rocky-mountains.webp"
          alt=""
          aria-hidden="true"
          fill
          className="object-cover object-bottom pointer-events-none select-none brightness-[0.35]"
          fetchPriority="high"
          priority
        />
        <div className="relative z-10 max-w-[1080px] w-full mx-auto">
          <SectionLabel className="pb-2 !text-bg !opacity-60">Who We Are</SectionLabel>
          <h1 className="type-title mb-4 max-w-[700px] text-bg">
            Building a Better Canada.
          </h1>
          <p className="type-body max-w-[600px] text-bg opacity-70 hidden md:block">
            Build Canada is a civic organization on a mission to make Canada the most prosperous country in the world. We publish bold policy research, build transparency tools, and bring together Canadian builders who are ready to act.
          </p>
          <p className="type-body max-w-[600px] text-bg opacity-70 md:hidden">
            Build Canada publishes bold policy research, build transparency tools, and brings together Canadian builders who are ready to act.
          </p>
        </div>
      </section>
      <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <OurStoryBlock />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <PlatformBlock />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
        <TeamBlock members={people.filter((p) => p.role !== "AUTHOR")} />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.9s" }}>
        <TestimonialsBlock testimonials={testimonials} />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "1.1s" }}>
        <QnaBlock items={qandaItems} />
      </div>
    </div>
  );
}
