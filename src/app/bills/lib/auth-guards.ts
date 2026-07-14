import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/bills/lib/auth";
import { DEV_OPEN_ACCESS } from "@/app/bills/env";
import { connectToDatabase } from "@/app/bills/lib/mongoose";
import { User } from "@/app/bills/models/User";
import { BASE_PATH } from "@/app/bills/utils/basePath";

// Re-exported for the API routes that gate on it. Defined in env.ts so it can
// be shared without creating an import cycle with auth.ts.
export { DEV_OPEN_ACCESS };

/**
 * Server-side authentication guard that requires a valid authenticated user.
 * Redirects to /unauthorized if:
 * - No session exists
 * - User email is not provided
 * - User does not exist in the database
 *
 * @returns Object containing the session and database user
 * @throws Redirects to /unauthorized if authentication fails
 */
export async function requireAuthenticatedUser() {
  // DEV ONLY: open access — skip the session/allowlist checks entirely.
  if (DEV_OPEN_ACCESS) {
    return { session: null, dbUser: null };
  }

  // Fail closed: if the session can't be resolved (e.g. missing
  // NEXTAUTH_SECRET throws in production), treat the user as signed out
  // instead of surfacing a 500.
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Failed to resolve session in auth guard:", error);
  }

  if (!session?.user?.email) {
    redirect(`${BASE_PATH}/unauthorized`);
  }

  // Verify the signed-in user exists in DB; do not create
  await connectToDatabase();
  const dbUser = await User.findOne({
    emailLower: session.user.email.toLowerCase(),
  });

  if (!dbUser) {
    redirect(`${BASE_PATH}/unauthorized`);
  }

  return { session, dbUser };
}
