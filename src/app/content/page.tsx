import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SectionLabel from "@/components/SectionLabel";
import { type ContentFeedItem } from "@/components/content";
import ContentFeedClient from "./ContentFeedClient";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const rawItems = await prisma.feedItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const items: ContentFeedItem[] = rawItems.map((item) => ({
    ...item,
    authorPhoto: item.authorPhoto,
    featured: item.featured,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <section className="relative px-5 h-[45svh] md:h-[65svh] flex flex-col justify-center border-b border-border-light overflow-hidden">
        <Image
          src="/assets/images/build-canada-community-meetup.webp"
          alt="Audience at a Build Canada community meetup event"
          fill
          className="object-cover brightness-[0.35]"
          priority
        />
        <div className="relative max-w-[1080px] mx-auto w-full">
          <SectionLabel className="text-white/60">Content</SectionLabel>
          <h1 className="type-title mb-1 text-white">
            Builders Move Fast by Design
          </h1>
          <p className="type-body text-white/70">
            Don&apos;t miss a beat. Check out Build Canada content below or
            follow us on your preferred socials channel.
          </p>
        </div>
      </section>
      <ContentFeedClient items={items} />
    </div>
  );
}
