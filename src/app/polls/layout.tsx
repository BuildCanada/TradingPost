import { requirePollAdmin } from "@/lib/poll-access";

export const metadata = { robots: { index: false, follow: false } };

export default async function PollsLayout({ children }: { children: React.ReactNode }) {
  await requirePollAdmin("/polls");
  return children;
}
