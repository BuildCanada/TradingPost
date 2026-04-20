import { fetchFeedPicks } from "@/lib/api";
import { IGCard, XCard, TikTokCard, SubstackCard, FeedCard } from "@/components/feed";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";

export default async function FeedPreview() {
  const items = await fetchFeedPicks("x,substack,memo|blog|builder,x:canada_spends");

  return (
    <div className="flex flex-col">
      <SectionHeader
        label="Latest Pieces"
        action={
          <Button as="link" variant="charcoal" href="/content">
            View all
          </Button>
        }
      />
      <div className="border-t border-l border-border-light grid grid-cols-1 cards:grid-cols-2">
        {items.length > 0
          ? items.map((item) =>
              item.type === "IG" ? (
                <IGCard key={item.id} item={item} />
              ) : item.type === "X" ? (
                <XCard key={item.id} item={item} />
              ) : item.type === "TIKTOK" ? (
                <TikTokCard key={item.id} item={item} />
              ) : item.type === "SUBSTACK" ? (
                <SubstackCard key={item.id} item={item} />
              ) : (
                <FeedCard key={item.id} item={item} />
              )
            )
          : [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[200px] border-b border-r border-border-light"
              />
            ))}
      </div>
    </div>
  );
}
