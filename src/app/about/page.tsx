import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SectionLabel from "@/components/SectionLabel";
import TestimonialsBlock from "@/components/TestimonialsBlock";
import OurStoryBlock from "./OurStoryBlock";
import PlatformBlock from "./PlatformBlock";
import TeamBlock from "./TeamBlock";
import QnaBlock from "./QnaBlock";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [teamMembers, testimonials] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }).catch(() => []),
  ]);

  return (
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)] overflow-x-clip">
      <section className="relative px-5 min-h-[280px] md:min-h-[420px] flex items-center border-b border-[var(--color-border-light)] overflow-hidden bg-[#3a3a3a]">
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
          <SectionLabel className="pb-2 !text-[var(--color-bg)] !opacity-60">Who We Are</SectionLabel>
          <h1 className="type-title mb-4 max-w-[700px] text-[var(--color-bg)]">
            Building a Better Canada.
          </h1>
          <p className="type-body max-w-[600px] text-[var(--color-bg)] opacity-70 hidden md:block">
            Build Canada is a civic organization on a mission to make Canada the most prosperous country in the world. We publish bold policy research, build transparency tools, and bring together Canadian builders who are ready to act.
          </p>
          <p className="type-body max-w-[600px] text-[var(--color-bg)] opacity-70 md:hidden">
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
