import Image from "next/image";
import { fetchMemos, fetchTestimonials, getSiteConfig } from "@/lib/api";
import FeaturedMemos from "@/components/FeaturedMemos";
import { ExitIntentHandler } from "@/components/subscribe";
import FeaturedProjects from "@/components/FeaturedProjects";
import { LinkButton } from "@/components/ui/link-button";
import { SubscribeButton } from "@/components/ui/subscribe-button";
import EventsTimeline from "@/components/EventsTimeline";
import FeedPreview from "@/components/FeedPreview";
import CyclingWord from "@/components/CyclingWord";
import SectionLabel from "@/components/SectionLabel";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateWebSiteSchema } from "@/lib/schemas/generators/website";
import { generateReviewSchema } from "@/lib/schemas/generators/review";
import { SOCIALS } from "@/constants/socials";

function HeroSection() {
  const s = "var(--color-bg)";
  const o = 0.2;

  return (
    <section className="w-full bg-dark flex items-center justify-center h-[45svh] md:h-[65svh] relative overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/assets/images/hero-poster.webp"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.35]"
      >
        <source
          src="/assets/videos/IntroVideo_buildcanada_splash.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 z-[5] pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 bottom-0 left-[6.7%] w-px"
          style={{
            backgroundColor: s,
            opacity: o,
            animation: "revealDown 1s ease-out forwards",
          }}
        />

        <div
          className="absolute top-0 bottom-0 right-[6.7%] w-px"
          style={{
            backgroundColor: s,
            opacity: o,
            animation: "revealUp 1s ease-out forwards",
          }}
        />

        <svg className="absolute left-0 top-[calc(15%-15px)]" width="65" height="130" viewBox="0 0 65 130" fill="none">
          <path
            d="M0 0C35.899 0 65 29.101 65 65C65 100.899 35.899 130 0 130"
            stroke={s} strokeOpacity={o} strokeWidth="1"
            pathLength="1" strokeDasharray="1" strokeDashoffset="1"
            style={{ animation: "drawIn 1.2s ease-out 0.3s forwards" }}
          />
          <path
            d="M0 8C31.48 8 57 33.52 57 65C57 96.48 31.48 122 0 122"
            stroke={s} strokeOpacity={o} strokeWidth="1"
            pathLength="1" strokeDasharray="1" strokeDashoffset="1"
            style={{ animation: "drawIn 1.2s ease-out 0.3s forwards" }}
          />
        </svg>

        <svg className="absolute right-0 bottom-[5%]" width="65" height="130" viewBox="0 0 65 130" fill="none">
          <path
            d="M65 0C29.101 0 0 29.101 0 65C0 100.899 29.101 130 65 130"
            stroke={s} strokeOpacity={o} strokeWidth="1"
            pathLength="1" strokeDasharray="1" strokeDashoffset="-1"
            style={{ animation: "drawInReverse 1.2s ease-out 0.3s forwards" }}
          />
          <path
            d="M65 8C33.52 8 8 33.52 8 65C8 96.48 33.52 122 65 122"
            stroke={s} strokeOpacity={o} strokeWidth="1"
            pathLength="1" strokeDasharray="1" strokeDashoffset="-1"
            style={{ animation: "drawInReverse 1.2s ease-out 0.3s forwards" }}
          />
        </svg>
      </div>

      <h1 className="relative z-10 type-display text-center">
        <span className="relative block">
          <span className="text-white">Building a </span>
          <span
            className="absolute left-1/2 -translate-x-1/2 bottom-[calc(0.2em-5px)] w-[200vw] h-px"
            style={{
              backgroundColor: s,
              opacity: o,
              animation: "revealRight 0.8s ease-out 0.4s forwards",
              clipPath: "inset(0 100% 0 0)",
            }}
          />
        </span>
        <span className="relative block whitespace-nowrap">
          <span className="invisible" aria-hidden="true">Stronger Canada.</span>
          <span className="absolute right-1/2 top-0 mr-[0.15em] text-right text-transparent">
            <CyclingWord />{" "}
          </span>
          <span className="absolute left-1/2 top-0 ml-[0.15em] text-white">
            {" "}Canada.
          </span>
          <span
            className="absolute left-1/2 -translate-x-1/2 bottom-[calc(0.2em-5px)] w-[200vw] h-px"
            style={{
              backgroundColor: s,
              opacity: o,
              animation: "revealRight 0.8s ease-out 0.7s forwards",
              clipPath: "inset(0 100% 0 0)",
            }}
          />
        </span>
      </h1>
    </section>
  );
}

function BrandSection() {
  return (
    <section className="border-b border-border-light">
      <div className="max-w-[1080px] w-full mx-auto lg:flex">
        <BrandMessaging />
        <Image
          src="/assets/images/canadian-flag-waving.webp"
          alt="Canadian flag waving against a blue sky"
          width={3896}
          height={2782}
          className="hidden lg:block lg:w-[30%] object-cover"
          sizes="(min-width: 1024px) 30vw, 0px"
        />
      </div>
    </section>
  );
}

function BrandMessaging() {
  return (
    <div className="px-5 py-12">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2">Old thinking won&apos;t save us.</SectionLabel>
        <p className="type-body mb-5">
          By almost every measure of growth and prosperity, Canada is falling
          behind.
        </p>
        <p className="type-body mb-5">
          <strong>
            Build Canada promotes the vision, ideas, and stories of Builders
            who believe Canada&apos;s best days are ahead.
          </strong>
        </p>
        <div className="flex items-center gap-3">
          <LinkButton href="/about" variant="primary">
            About Us
          </LinkButton>
          <SubscribeButton variant="accent" source="inline">
            Subscribe
          </SubscribeButton>
        </div>
      </div>
    </div>
  );
}

function SocialLinks() {
  return (
    <div className="pt-3 pb-8">
      <div className="max-w-[1080px] mx-auto flex items-center gap-2 flex-wrap">
        {SOCIALS.map(({ label, href, iconFile }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[53px] px-4 border border-border-light flex items-center justify-center hover:border-dark transition-colors group"
          >
            <Image
              src={`/assets/icons/${iconFile}.svg`}
              alt={label}
              width={20}
              height={20}
              className="brightness-0 opacity-40 group-hover:opacity-80 transition-opacity"
              unoptimized
            />
          </a>
        ))}
        <div className="w-px h-[18px] bg-border-light mx-0.5" />
        <LinkButton href="/content" variant="primary">
          Full Archive
        </LinkButton>
      </div>
    </div>
  );
}


function FeedAndEvents() {
  return (
    <section className="px-5 py-12 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto flex flex-wrap justify-center gap-[20px]">
        <div className="w-full md:w-auto md:flex-1 md:max-w-[768px] min-w-0">
          <FeedPreview />
        </div>
        <div className="w-full md:w-[500px]">
          <EventsTimeline />
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const memos = await fetchMemos();
  const testimonials = await fetchTestimonials();
  const configData = getSiteConfig();

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

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateWebSiteSchema(configData),
    ...reviewSchemas
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <BrandSection />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <FeaturedMemos memos={memos} />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "1.2s" }}>
        <FeedAndEvents />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "1.6s" }}>
        <FeaturedProjects />
      </div>
      <ExitIntentHandler />
    </div>
  );
}
