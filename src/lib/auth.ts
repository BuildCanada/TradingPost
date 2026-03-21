import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    signIn({ profile }) {
      if (!profile?.email) return false;
      return allowedEmails.includes(profile.email.toLowerCase());
    },
    session({ session }) {
      return session;
    },
  },
});
