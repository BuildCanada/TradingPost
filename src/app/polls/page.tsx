import Link from "next/link";
import { requirePollAdmin } from "@/lib/poll-access";
import { primeAdminPreviewToken } from "@/lib/preview";
import type { Metadata } from "next";
import { fetchPolls } from "@/lib/api/polls";

export const metadata: Metadata = {
  title: "Polls | Build Canada",
  description:
    "Public opinion research, analysis and crosstabs from Build Canada.",
  alternates: { canonical: "/polls" },
};

export default async function PollsPage() {
  await requirePollAdmin("/polls");
  await primeAdminPreviewToken();
  const polls = await fetchPolls();
  return (
    <main className="max-w-[1000px] mx-auto px-6 py-12">
      <h1 className="type-title-lg mb-4">Polls</h1>
      <p className="type-body mb-10">
        Public opinion research, analysis and crosstabs.
      </p>
      {polls.length ? (
        <ul className="space-y-6">
          {polls.map((poll) => (
            <li key={poll.id} className="border-t border-border-light pt-6">
              <Link
                href={`/polls/${poll.slug}`}
                className="type-title-sm hover:underline"
              >
                {poll.title}
              </Link>
              {poll.publishedAt && (
                <p className="type-label mt-2">
                  {new Date(poll.publishedAt).toLocaleDateString("en-CA", {
                    dateStyle: "long",
                    timeZone: "UTC",
                  })}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No polls have been published yet.</p>
      )}
    </main>
  );
}
