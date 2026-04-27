import CredentialsProvider from "next-auth/providers/credentials";
// Swap-in when ready (also add Account linking / PrismaAdapter as needed):
// import GoogleProvider from "next-auth/providers/google";

import { TEST_CREDENTIALS } from "@/lib/auth-constants";
import { prisma } from "@/lib/prisma";

/**
 * Auth providers for NextAuth.
 * Credentials are active today; Google OAuth can be appended here once
 * GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are configured and users are persisted
 * (recommended: PrismaAdapter + Account model, or upsert User in signIn callback).
 */
export function buildAuthProviders() {
  return [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!username || !password) {
          return null;
        }
        if (username !== TEST_CREDENTIALS.username || password !== TEST_CREDENTIALS.password) {
          return null;
        }

        const user = await prisma.user.upsert({
          where: { username: TEST_CREDENTIALS.username },
          create: {
            username: TEST_CREDENTIALS.username,
            email: "ryan@imaginal.local",
            name: "Ryan"
          },
          update: {}
        });

        return {
          id: user.id,
          name: user.name ?? "Ryan",
          email: user.email ?? "ryan@imaginal.local"
        };
      }
    })
    /* Google OAuth (future):
    , GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
      })
    */
  ];
}
