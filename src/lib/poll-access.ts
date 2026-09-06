import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export async function requirePollAdmin(path: string) {
  const user = await getCurrentUser();
  if (!user?.admin) redirect(`/polls-access?redirect=${encodeURIComponent(path)}`);
  return user;
}

export async function pollAccessDenied(path: string): Promise<Response | null> {
  const user = await getCurrentUser();
  if (user?.admin) return null;
  return Response.json({
    error: "Polls are available to administrators only.",
    login: `/api/auth/login?redirect=${encodeURIComponent(path)}`,
  }, { status: user ? 403 : 401, headers: { "Cache-Control": "private, no-store" } });
}
