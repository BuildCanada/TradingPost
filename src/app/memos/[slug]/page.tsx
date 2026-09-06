import { ArticlePage, articleMetadata } from "@/components/content/ArticlePage";
import { fetchMemos } from "@/lib/api/memos";

export async function generateStaticParams() {
  try { return (await fetchMemos()).map((item) => ({ slug: item.slug })); }
  catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return articleMetadata((await params).slug, "memos");
}

export default async function MemoPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticlePage slug={(await params).slug} kind="memos" />;
}
