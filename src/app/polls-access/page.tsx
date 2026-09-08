import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/lib/oauth";

export const metadata = {
  title: "Polls",
  robots: { index: false, follow: false },
};

export default async function PollsAccessPage({
  searchParams,
}: { searchParams: Promise<{ redirect?: string }> }) {
  const requested = safeRedirectPath((await searchParams).redirect);
  const destination = requested === "/polls" || requested.startsWith("/polls/") ? requested : "/polls";
  redirect(destination);
}
