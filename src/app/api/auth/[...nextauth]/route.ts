import NextAuth from "next-auth";

import { authOptions, NEXTAUTH_SECRET } from "@/lib/auth-options";

/**
 * Spread `authOptions` then set `secret` explicitly so NextAuth always receives it
 * (fixes [NO_SECRET] when env is merged at runtime for this handler).
 */
const handler = NextAuth({
  ...authOptions,
  secret: NEXTAUTH_SECRET ?? process.env.NEXTAUTH_SECRET?.trim()
});

export { handler as GET, handler as POST };
