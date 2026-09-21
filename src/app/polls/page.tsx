import Link from "next/link";
import type { Metadata } from "next";
import { primeAdminPreviewToken } from "@/lib/preview";
import { fetchPolls } from "@/lib/api/polls";
import { PageHeader } from "@/components/ui/page-header";
import FeaturedCard from "@/components/FeaturedCard";
import SectionLabel from "@/components/SectionLabel";
import { formatEditorialDate } from "@/lib/date-format";

export const metadata: Metadata = {
  title: "Polls | Build Canada",
  description: "Public opinion research and analysis from Build Canada",
  alternates: { canonical: "/polls" },
};

export default async function PollsPage() {
  await primeAdminPreviewToken();
  const polls = (await fetchPolls()).sort((a, b) =>
    (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0),
  );
  const [latestPoll, ...earlierPolls] = polls;
  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <PageHeader title="Polls — What Canadians Think" description="Public opinion research and analysis from Build Canada" />
      <section className="px-5 py-10 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel as="h2" className="mb-6">Latest poll</SectionLabel>
          {latestPoll ? (
            <FeaturedCard memo={{ ...latestPoll, author: null, category: "poll", keyMessage1: latestPoll.subtitle }} label="Latest poll" wide priority basePath="/polls" />
          ) : <p className="type-body text-text-secondary">No polls have been published yet.</p>}
        </div>
      </section>
      {earlierPolls.length > 0 && (
        <section className="px-5 py-10 border-b border-border-light">
          <div className="max-w-[1080px] mx-auto">
            <SectionLabel as="h2">Earlier polls</SectionLabel>
            <ul className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border-light mt-6">
              {earlierPolls.map((poll) => (
                <li key={poll.id} className="border-b border-r border-border-light">
                  <Link href={`/polls/${poll.slug}`} className="flex flex-col h-full p-6 group hover:bg-linen-50 transition-colors">
                    <h3 className="type-h3 group-hover:text-accent">{poll.title}</h3>
                    {poll.publishedAt && <p className="type-label text-text-secondary mt-2">{formatEditorialDate(poll.publishedAt)}</p>}
                    {poll.subtitle && <p className="type-body text-text-secondary mt-3">{poll.subtitle}</p>}
                    <span className="type-label text-text-secondary mt-6">Read poll →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <nav aria-label="Polling information" className="px-5 py-8">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row gap-4 sm:gap-8 type-label">
          <Link href="/polls/methodology" className="underline hover:text-accent">How we poll</Link>
          <Link href="/polls/privacy-policy" className="underline hover:text-accent">Polling privacy policy</Link>
        </div>
      </nav>
    </div>
  );
}
