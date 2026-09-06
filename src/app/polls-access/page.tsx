import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/oauth";

export const metadata = {
  title: "Polls — Administrator access",
  robots: { index: false, follow: false },
};

export default async function PollsAccessPage({
  searchParams,
}: { searchParams: Promise<{ redirect?: string }> }) {
  const user = await getCurrentUser();
  const requested = safeRedirectPath((await searchParams).redirect);
  const destination = requested === "/polls" || requested.startsWith("/polls/") ? requested : "/polls";
  if (user?.admin) redirect(destination);
  return (
    <section className="max-w-[720px] mx-auto px-6 py-16">
      <h1 className="type-title mb-4">Administrator access</h1>
      <p className="type-body mb-6">
        {user ? "Your account does not have administrator access to polls." : "Log in with an administrator account to view polls."}
      </p>
      <Link className="underline" href={`/api/auth/login?redirect=${encodeURIComponent(destination)}`}>
        {user ? "Log in with another account" : "Log in"}
      </Link>
    </section>
  );
}
