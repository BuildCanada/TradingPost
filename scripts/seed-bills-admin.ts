/**
 * One-off bootstrap: grant isAdmin to a user so the /bills/api/users
 * allowlist endpoint can be managed via the API. Run once per environment.
 *
 * Usage: pnpm seed:bills-admin <email>
 */
import { connectToDatabase } from "@/bills/lib/mongoose";
import { User } from "@/bills/models/User";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: pnpm seed:bills-admin <email>");
    process.exit(1);
  }
  const emailLower = email.trim().toLowerCase();

  await connectToDatabase();

  const user = await User.findOneAndUpdate(
    { emailLower },
    {
      $set: { isAdmin: true, allowed: true },
      $setOnInsert: { email, emailLower },
    },
    { upsert: true, new: true },
  );

  console.log(`Granted admin access to ${user.email} (isAdmin=${user.isAdmin})`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to seed bills admin:", error);
  process.exit(1);
});
