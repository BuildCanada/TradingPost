import Image from "next/image";
import { prisma } from "@/lib/prisma";
import FeedPreview from "@/components/FeedPreview";
import FeaturedMemos from "@/components/FeaturedMemos";
import { ExitIntentHandler } from "@/components/subscribe";
import SectionLabel from "@/components/SectionLabel";
import FeaturedProjects from "@/components/FeaturedProjects";
import { LinkButton } from "@/components/ui/link-button";
import { SubscribeButton } from "@/components/ui/subscribe-button";
import EventsTimeline from "@/components/EventsTimeline";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateWebSiteSchema } from "@/lib/schemas/generators/website";
import { generateReviewSchema } from "@/lib/schemas/generators/review";

export const dynamic = "force-dynamic";

async function getMemos() {
  const memos = await prisma.memo.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });
  return memos.map((m) => ({
    ...m,
    author: {
      name: m.author.name,
      photo:
        m.author.name === "Build Canada"
          ? "/assets/logos/Logocircle.webp"
          : m.author.photo,
    },
    publishedAt: m.publishedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  }));
}

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
          <span className="text-white">Canada&apos;s Voice</span>
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
        <span className="relative block">
          <span
            className="text-transparent"
            style={{ WebkitTextStroke: "1px white" }}
          >
            for
          </span>{" "}
          <span className="text-white">Builders.</span>
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
    <div className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px]">
      <div className="max-w-[1080px] mx-auto">
      <h2 className="type-title mb-4">
        Old thinking won&apos;t save us.
      </h2>
      <p className="type-body mb-5">
        By almost every measure of growth and prosperity, Canada is falling
        behind. It doesn&apos;t have to be this way.<br />
        <strong>
          Build Canada platforms the policy, ideas, and narratives of Builders
          who believe Canada&apos;s best days are ahead.
        </strong>
      </p>
      <div className="flex items-center gap-3">
        <LinkButton href="/about" variant="primary" showArrow>
          About Us
        </LinkButton>
        <SubscribeButton variant="accent" showArrow source="inline">
          Subscribe
        </SubscribeButton>
      </div>
      </div>
    </div>
  );
}

function SocialLinks() {
  const socials = [
    { icon: "X", href: "https://x.com/build_canada" },
    { icon: "LINKEDIN", href: "https://www.linkedin.com/company/buildcanada" },
    { icon: "TIKTOK", href: "https://www.tiktok.com/@build_canada" },
    { icon: "IG", href: "https://www.instagram.com/build_canada/" },
    { icon: "SUBSTACK", href: "https://buildcanada.substack.com/" },
    { icon: "YOUTUBE", href: "https://www.youtube.com/@BuildCanada" },
  ];
  return (
    <div className="pt-3 pb-[32px]">
      <div className="max-w-[1080px] mx-auto flex items-center gap-2 flex-wrap">
        {socials.map(({ icon, href }) => (
          <a
            key={icon}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-[53px] h-[53px] border border-border-light flex items-center justify-center hover:border-dark transition-colors group"
          >
            <Image
              src={`/assets/icons/${icon === "X" ? "platform-x-twitter" : icon === "LINKEDIN" ? "platform-linkedin" : icon === "TIKTOK" ? "platform-tiktok" : icon === "IG" ? "platform-instagram" : icon === "SUBSTACK" ? "substack-icon" : "platform-youtube"}.svg`}
              alt={icon}
              width={20}
              height={20}
              className="brightness-0 opacity-40 group-hover:opacity-80 transition-opacity"
              unoptimized
            />
          </a>
        ))}
        <div className="w-px h-[18px] bg-border-light mx-0.5" />
        <LinkButton href="/content" variant="primary" >
          Full Content Feed →
        </LinkButton>
      </div>
    </div>
  );
}


function FeedAndEvents() {
  return (
    <section className="px-5 border-b border-border-light">
      <div className="max-w-[1080px] mx-auto flex flex-wrap justify-center gap-[20px]">
        <div className="w-full md:w-auto md:flex-1 md:max-w-[768px] min-w-0">
          <FeedPreview />
        </div>

        <div className="w-full md:hidden -mx-5 px-0" style={{ width: "calc(100% + 40px)" }}>
          <div className="border-t border-border-light" />
        </div>

        <div className="w-full md:w-[500px] pt-[26px] pb-[36px]">
          <EventsTimeline />
        </div>
      <div className="w-full min-w-0">
      <SocialLinks />
      </div>
      </div>

    </section>
  );
}

export default async function Home() {
  const memos = await getMemos();

  let siteConfig = await prisma.siteConfig.findUnique({ where: { id: "site" } });
  if (!siteConfig) {
    siteConfig = await prisma.siteConfig.create({ data: { id: "site" } });
  }
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
    include: { person: true },
  });

  const configData = {
    orgName: siteConfig.orgName,
    orgDescription: siteConfig.orgDescription,
    siteUrl: siteConfig.siteUrl,
    logoUrl: siteConfig.logoUrl,
    socialLinks: siteConfig.socialLinks,
  };

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
        <FeaturedMemos heading="Featured + Latest Memos" memos={memos} />
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
