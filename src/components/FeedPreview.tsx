import { fetchFeedPicks } from "@/lib/api";
import {
  IGCard,
  XCard,
  TikTokCard,
  SubstackCard,
  MemoCard,
  BuilderCard,
  BlogCard,
  FeedCard,
} from "@/components/feed";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";

export default async function FeedPreview() {
  const picks = await fetchFeedPicks("x,substack,blog|builder,x:canada_spends");
  const items = Array.from(
    new Map(picks.map((item) => [item.id, item])).values(),
  );

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
          ? items.map((item) => {
              switch (item.type) {
                case "IG":
                  return <IGCard key={item.id} item={item} />;
                case "X":
                  return <XCard key={item.id} item={item} />;
                case "TIKTOK":
                  return <TikTokCard key={item.id} item={item} />;
                case "SUBSTACK":
                  return <SubstackCard key={item.id} item={item} />;
                case "MEMO":
                  return <MemoCard key={item.id} item={item} />;
                case "BUILDER":
                  return <BuilderCard key={item.id} item={item} />;
                case "BLOG":
                  return <BlogCard key={item.id} item={item} />;
                default:
                  return <FeedCard key={item.id} item={item} />;
              }
            })
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
