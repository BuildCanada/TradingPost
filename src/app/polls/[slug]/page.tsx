import { ArticlePage, articleMetadata } from "@/components/content/ArticlePage";
import { fetchPolls } from "@/lib/api/polls";

export async function generateStaticParams() {
  try { return (await fetchPolls()).map((item) => ({ slug: item.slug })); }
  catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return articleMetadata((await params).slug, "polls");
}

export default async function PollPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticlePage slug={(await params).slug} kind="polls" />;
}
