import type { Metadata } from "next";
import Image from "next/image";
import { fetchMemos } from "@/lib/api";
import SectionLabel from "@/components/SectionLabel";
import { LinkButton } from "@/components/ui/link-button";
import { SubscribeButton } from "@/components/ui/subscribe-button";
import { SectionHeader } from "@/components/ui/section-header";
import PickCard from "@/components/PickCard";

export const metadata: Metadata = {
  title: "Build Canada - Toronto",
  description:
    "Toronto is not the greatest city in the world. But it should be. Memos and ideas to help build a better Toronto.",
  alternates: { canonical: "/toronto" },
  openGraph: {
    title: "Build Canada - Toronto",
    description:
      "Build the Toronto you know is possible — bold ideas from notable Torontonians.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Canada - Toronto",
    description: "Build the Toronto you know is possible.",
  },
};

function HeroSection() {
  return (
    <section className="relative border-b border-border-light w-full aspect-[4/5] md:aspect-[5/4] max-h-[900px] overflow-hidden">
      <Image
        src="/assets/images/toronto/hero.jpg"
        alt="Toronto skyline"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 px-5 pt-12 md:pt-20">
        <div className="max-w-[1080px] mx-auto">
          <h1 className="type-display text-dark">
            Build the Toronto
            <br />
            <span className="text-accent">You Know is Possible</span>
          </h1>
          <blockquote className="type-body italic max-w-[560px] text-dark mt-8 mb-8">
            &ldquo;Toronto is not the greatest city in the world. But it
            should be.&rdquo;
          </blockquote>
          <div className="flex flex-wrap items-center gap-3">
            <SubscribeButton variant="accent" source="inline">
              Get Updates
            </SubscribeButton>
            <LinkButton href="/toronto/about" variant="secondary">
              Get Involved
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="px-5 py-12 md:py-20 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2" className="mb-8 md:mb-12">
          Building a Better Toronto
        </SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 items-start">
          <div className="relative aspect-[3/4] max-w-[420px] w-full">
            <Image
              src="/assets/images/toronto/gardiner.jpg"
              alt="Frederick Gardiner, First Chairman of Metropolitan Toronto"
              fill
              sizes="(min-width: 956px) 420px, 100vw"
              className="object-cover"
            />
            <span className="absolute bottom-0 left-0 right-0 p-4 type-label text-bg bg-gradient-to-t from-black/80 to-transparent">
              Frederick Gardiner,
              <br />
              First Chairman of
              <br />
              Metropolitan Toronto
            </span>
          </div>
          <div className="mt-8 md:mt-0">
            <div className="type-body text-dark/80 space-y-4">
              <p>
                We&rsquo;re Torontonians who refuse to accept our city&rsquo;s
                managed decline. We believe Toronto should be something
                greater: a city of energy and beauty, where world-class
                infrastructure and serious governance let people thrive.
              </p>
              <p>
                We help notable Torontonians share their bold policy ideas to
                make that a reality.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <LinkButton href="/toronto/about" variant="primary">
                Learn More
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PolicyIdeasSection({
  memos,
}: {
  memos: Awaited<ReturnType<typeof fetchMemos>>;
}) {
  const cards = memos.slice(0, 4);

  if (cards.length === 0) {
    return (
      <section className="px-5 py-12 md:py-20 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="Policy ideas to grow Toronto" />
          <p className="type-body text-dark/70 max-w-[640px]">
            New memos are on the way. Subscribe to be the first to read them.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-12 md:py-20 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionHeader
          label="Policy ideas to grow Toronto"
          action={
            <LinkButton href="/toronto/memos" variant="primary">
              See more memos
            </LinkButton>
          }
        />
        <p className="type-body text-dark/70 max-w-[640px] mb-8">
          We help notable Torontonians share their bold ideas to grow our city.
        </p>
        <div className="grid grid-cols-1 cards:grid-cols-2 wide:grid-cols-4 gap-0 border-t border-border-light">
          {cards.map((m) => (
            <PickCard key={m.id} memo={m} basePath="/toronto/memos" />
          ))}
        </div>
        <LinkButton
          href="/toronto/memos"
          className="compact:hidden flex w-full justify-center mt-6"
        >
          See more memos
        </LinkButton>
      </div>
    </section>
  );
}

function SubscribeCTA() {
  return (
    <section className="px-5 py-16 md:py-24 bg-bg">
      <div className="max-w-[760px] mx-auto text-center">
        <SectionLabel as="h2">Be first to know what&rsquo;s possible</SectionLabel>
        <p className="type-body mt-4 mb-8 text-dark/80">
          Get new memos, updates from our team, and ideas to help Toronto grow.
        </p>
        <div className="flex justify-center">
          <SubscribeButton variant="accent" source="inline">
            Subscribe
          </SubscribeButton>
        </div>
      </div>
    </section>
  );
}

export default async function TorontoHome() {
  const memos = await fetchMemos({ publication: "build_toronto" });

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <HeroSection />
      <MissionSection />
      <PolicyIdeasSection memos={memos} />
      <SubscribeCTA />
    </div>
  );
}
