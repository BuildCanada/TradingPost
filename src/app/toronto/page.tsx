import type { Metadata } from "next";
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
    <section className="relative px-5 py-[100px] md:py-[140px] border-b border-border-light bg-dark text-bg overflow-hidden">
      <div className="max-w-[1080px] mx-auto relative z-10">
        <SectionLabel as="h2" className="text-bg/70">
          Build Canada — Toronto
        </SectionLabel>
        <h1 className="type-display mt-4 mb-6 text-bg">
          Build the Toronto You Know is Possible
        </h1>
        <blockquote className="type-body max-w-[640px] text-bg/80 mb-3 italic">
          &ldquo;Toronto is not the greatest city in the world. But it should
          be.&rdquo;
        </blockquote>
        <p className="type-label text-bg/60 mb-10 max-w-[640px]">
          &mdash; Frederick Gardiner, First Chairman of Metropolitan Toronto
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SubscribeButton variant="accent" source="inline">
            Get Updates
          </SubscribeButton>
          <LinkButton href="/toronto/about" variant="secondary">
            Get Involved
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="px-5 py-12 md:py-20 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-x-12 items-start">
        <div className="md:pr-12 md:border-r md:border-border-light flex md:items-center">
          <SectionLabel as="h2">Building a better Toronto</SectionLabel>
        </div>
        <div className="mt-6 md:mt-0">
          <div className="type-body text-dark/80 space-y-4">
            <p>
              We&rsquo;re Torontonians who refuse to accept our city&rsquo;s
              managed decline. We believe Toronto should be something greater:
              a city of energy and beauty, where world-class infrastructure
              and serious governance let people thrive.
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
