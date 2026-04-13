import { Suspense } from "react";
import Image from "next/image";
import { fetchFeedItems, getSiteConfig } from "@/lib/api";
import SectionLabel from "@/components/SectionLabel";
import ContentFeedClient from "./ContentFeedClient";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";

export default async function ContentPage() {
  const items = await fetchFeedItems();
  const configData = getSiteConfig();

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema("/content", "Content", configData.siteUrl)
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
      <Suspense fallback={null}>
        <ContentFeedClient items={items} />
      </Suspense>
    </div>
  );
}
