import { ArticlePage, articleMetadata } from "@/components/content/ArticlePage";
import { requirePollAdmin } from "@/lib/poll-access";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requirePollAdmin(`/polls/${slug}`);
  return articleMetadata(slug, "polls");
}

export default async function PollPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requirePollAdmin(`/polls/${slug}`);
  return <ArticlePage slug={slug} kind="polls" />;
}
