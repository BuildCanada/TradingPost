import Image from "next/image";
import SectionLabel from "@/components/SectionLabel";
import ContentFeed from "./ContentFeed";

export default function ContentPage() {
  return (
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)]">
      <section className="relative px-5 border-b border-[var(--color-border-light)] overflow-hidden">
        <Image
          src="/assets/images/build-canada-community-meetup.webp"
          alt="Audience at a Build Canada community meetup event"
          fill
          className="object-cover brightness-[0.35]"
          priority
        />
        <div className="relative max-w-[1080px] mx-auto py-[60px] md:pt-[140px] md:pb-[80px] lg:pt-[180px]">
          <SectionLabel className="text-white/60">Content</SectionLabel>
          <h1 className="type-title mb-1 text-white">
            Builders Move Fast by Design
          </h1>
          <p className="type-body text-white/70">
            Don&apos;t miss a beat. Check out Build Canada content below or follow us on your preferred socials channel.
          </p>
        </div>
      </section>
      <ContentFeed />
    </div>
  );
}
