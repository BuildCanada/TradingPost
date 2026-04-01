import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SectionLabel from "@/components/SectionLabel";
import TestimonialsBlock from "@/components/TestimonialsBlock";
import OurStoryBlock from "./OurStoryBlock";
import PlatformBlock from "./PlatformBlock";
import TeamBlock from "./TeamBlock";
import QnaBlock from "./QnaBlock";
import { buildGraph, createOrganization, createFAQPage, type FAQItem } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [teamMembers, testimonials] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }).catch(() => []),
  ]);

  const qnaItems: FAQItem[] = [
    {
      question: "Is Build Canada affiliated with a political party?",
      answer: "No. Build Canada is non-partisan. Our work is driven by one question: how do we make Canada the most prosperous country in the world?",
    },
    {
      question: "How is Build Canada funded?",
      answer: "We're a federally incorporated non-profit organization funded by over 60 individual donors who believe in building a stronger country. We don't accept government grants or public funding, which keeps us independent.",
    },
    {
      question: "Is Build Canada a lobby group?",
      answer: "No. We produce research, build community among Canadian founders and operators, and share policy ideas in public.",
    },
    {
      question: "Do you support a specific policy platform?",
      answer: "We champion ideas that make Canada a better place to build and grow our economy — whether that means tax reform, talent retention, infrastructure investment, or regulatory modernization. If you want to learn more about where we stand and our latest ideas, follow along with our content — we're always publishing new ideas and perspectives from builders across the country.",
    },
  ];

  const jsonLd = buildGraph(
    createOrganization(),
    createFAQPage(qnaItems)
  );

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
        <TeamBlock members={teamMembers} />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.9s" }}>
        <TestimonialsBlock testimonials={testimonials} />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "1.1s" }}>
        <QnaBlock />
      </div>
    </div>
  );
}
