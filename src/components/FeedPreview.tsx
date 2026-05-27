import { fetchFeedPicks, fetchPosts } from "@/lib/api";
import {
  IGCard,
  XCard,
  TikTokCard,
  SubstackCard,
  MemoCard,
  BuilderCard,
  StatementCard,
  FeedCard,
  type FeedItem,
} from "@/components/feed";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";

export default async function FeedPreview() {
  const [picks, posts] = await Promise.all([
    fetchFeedPicks("x,substack,builder,x:canada_spends"),
    fetchPosts(),
  ]);

  const latestPost = posts
    .filter((p) => p.publishedAt)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))[0];

  const builderIdx = picks.findIndex((p) => p.type === "BUILDER");
  const builderPick = builderIdx >= 0 ? picks[builderIdx] : null;

  const postIsNewer =
    latestPost &&
    (!builderPick ||
      (latestPost.publishedAt ?? "") > builderPick.publishedAt);

  if (latestPost && postIsNewer) {
    const postFeedItem: FeedItem = {
      id: `post-${latestPost.id}`,
      type: "POST",
      feedableType: "Post",
      title: latestPost.title,
      subtitle: null,
      author: latestPost.author?.name ?? null,
      accountHandle: null,
      image: latestPost.bannerImage,
      body: latestPost.keyMessage1,
      url: null,
      slug: latestPost.slug,
      authorPhoto: latestPost.author?.photo ?? null,
      publishedAt: latestPost.publishedAt ?? latestPost.createdAt,
      createdAt: latestPost.publishedAt ?? latestPost.createdAt,
    };
    if (builderIdx >= 0) {
      picks.splice(builderIdx, 1, postFeedItem);
    } else {
      picks.push(postFeedItem);
    }
  }

  const items = Array.from(
    new Map(picks.map((item) => [item.id, item])).values(),
  );

  return (
    <div className="flex flex-col">
      <SectionHeader
        label="Latest Pieces"
        action={
          <Button as="link" variant="charcoal" href="/posts">
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
                case "POST":
                  return <StatementCard key={item.id} item={item} />;
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
