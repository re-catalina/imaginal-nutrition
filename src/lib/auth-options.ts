import type { NextAuthOptions } from "next-auth";

import { buildAuthProviders } from "@/lib/auth-providers";

/** Resolved once per process — trims accidental whitespace from .env */
export const NEXTAUTH_SECRET =
  typeof process.env.NEXTAUTH_SECRET === "string"
    ? process.env.NEXTAUTH_SECRET.trim()
    : process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  providers: buildAuthProviders(),
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  /** Required for `getServerSession(authOptions)` in API routes */
  secret: NEXTAUTH_SECRET
};
