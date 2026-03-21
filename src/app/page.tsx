import Link from "next/link";
import FeedPreview from "@/components/FeedPreview";
import FeaturedMemos from "@/components/FeaturedMemos";
import SubscribeForm from "@/components/SubscribeForm";
import SectionLabel from "@/components/SectionLabel";
import FeaturedProjects from "@/components/FeaturedProjects";

function HeroSection() {
  const s = "var(--color-bg)";
  const o = 0.2;

  return (
    <section className="w-full bg-[var(--color-dark)] flex items-center justify-center h-[280px] md:h-[420px] relative overflow-hidden">
      {/* Autoplay video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[0.35]"
      >
        <source
          src="/assets/IntroVideo_4k_buildcanada_splash.mp4"
          type="video/mp4"
        />
      </video>

      {/* Decorative overlay */}
      <div className="absolute inset-0 z-[5] pointer-events-none" aria-hidden="true">
        {/* Left vertical line — draws top→bottom */}
        <div
          className="absolute top-0 bottom-0 left-[6.7%] w-px"
          style={{
            backgroundColor: s,
            opacity: o,
            animation: "revealDown 1s ease-out forwards",
          }}
        />

        {/* Right vertical line — draws bottom→top */}
        <div
          className="absolute top-0 bottom-0 right-[6.7%] w-px"
          style={{
            backgroundColor: s,
            opacity: o,
            animation: "revealUp 1s ease-out forwards",
          }}
        />

        {/* Top-left semicircles — draw top→bottom, start at 0.3s */}
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

        {/* Bottom-right semicircles — draw bottom→top (reverse), start at 0.3s */}
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

      {/* Text with baseline-aligned horizontal lines */}
      <h1 className="relative z-10 type-display text-center">
        <span className="relative block">
          <span className="text-white">Canada&apos;s Voice</span>
          {/* Top horizontal line — draws left→right, starts at 0.4s */}
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
          {/* Bottom horizontal line — draws left→right, starts at 0.7s */}
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
    <section className="border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] w-full mx-auto lg:flex">
        <BrandMessaging />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/canadian-flag-waving.webp"
          alt="Canadian flag waving against a blue sky"
          className="hidden lg:block lg:w-[30%] object-cover"
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
        In a changing world, Canada must reinvent itself. Builders are those
        scaffolding out the blueprint drawings. Build Canada spreads their
        philosophies.{" "}
        <span style={{ backgroundColor: "#F1B0B0", fontWeight: "bold" }}>
          We platforms the policy, ideas, and narratives of Canadians
        </span>{" "}
        at the forefront of the new Canadian economy.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/about"
          className="inline-flex items-center gap-2 type-label px-3 py-1 border border-[var(--color-dark)] text-[var(--color-dark)] bg-[var(--color-bg)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
        >
          About Us
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 12l8-8M6 4h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link
          href="#subscribe"
          className="inline-flex items-center gap-2 type-label px-3 py-1 border border-[var(--color-accent)] text-white bg-[var(--color-accent)] hover:opacity-80 transition-opacity"
        >
          Subscribe
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 12l8-8M6 4h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
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
      <div className="max-w-[768px] mx-auto flex items-center gap-2 flex-wrap">
        {socials.map(({ icon, href }) => (
          <a
            key={icon}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 border border-[var(--color-border-light)] flex items-center justify-center hover:border-[var(--color-dark)] transition-colors group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/assets/icons/${icon === "X" ? "platform-x-twitter" : icon === "LINKEDIN" ? "platform-linkedin" : icon === "TIKTOK" ? "platform-tiktok" : icon === "IG" ? "platform-instagram" : icon === "SUBSTACK" ? "substack-icon" : "platform-youtube"}.svg`}
              alt={icon}
              width={14}
              height={14}
              className="brightness-0 opacity-40 group-hover:opacity-80 transition-opacity"
            />
          </a>
        ))}
        <div className="w-px h-[18px] bg-[var(--color-border-light)] mx-0.5" />
        <Link
          href="/feed"
          className="h-7 px-2.5 border border-[var(--color-border-light)] flex items-center type-label text-[var(--color-dark)] hover:border-[var(--color-dark)] transition-colors"
        >
          Full Feed →
        </Link>
      </div>
    </div>
  );
}


function FeedAndEvents() {
  return (
    <section className="px-5 border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] mx-auto flex flex-wrap justify-center gap-[20px]">
        {/* Feed + Social */}
        <div className="w-full md:w-auto md:flex-1 md:max-w-[768px] min-w-0">
          <FeedPreview />
          <SocialLinks />
        </div>

        {/* Divider between feed and events (visible only when stacked) */}
        <div className="w-full md:hidden -mx-5 px-0" style={{ width: "calc(100% + 40px)" }}>
          <div className="border-t border-[var(--color-border-light)]" />
        </div>

        {/* Events */}
        <div className="w-full md:w-[500px] pt-[26px] pb-[36px]">
          <SectionLabel>Events</SectionLabel>
          <iframe
            src="https://luma.com/embed/calendar/cal-KUFO2yscrfWr7RV/events"
            width="100%"
            height="450"
            frameBorder="0"
            style={{ border: `1px solid var(--color-border-light)` }}
            allowFullScreen
            aria-hidden="false"
            tabIndex={0}
          />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)]">
      <HeroSection />
      <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <BrandSection />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <FeaturedMemos heading="Featured + Latest Memos" />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "1.2s" }}>
        <FeedAndEvents />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "1.6s" }}>
        <FeaturedProjects />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "2.0s" }}>
        <SubscribeForm />
      </div>
    </div>
  );
}
