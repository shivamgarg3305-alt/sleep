import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * Deliberately Google-only: no credentials provider, no email/magic-link.
 *
 * Session strategy is JWT, even though we now have a Prisma adapter. This is
 * intentional, not a leftover: `middleware.ts` runs on the Edge runtime, and
 * plain `@prisma/client` (without a driver adapter like Neon's edge driver)
 * cannot run there. Using the adapter alongside `strategy: "jwt"` gives us
 * the best of both — Google sign-in still upserts a real `User`/`Account`
 * row in Postgres via the adapter, but the session itself is a signed JWT
 * that middleware can verify without touching the database.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    /**
     * Redirect guard: after sign-in, always land on /dashboard regardless
     * of where the flow started, unless a relative callbackUrl was passed
     * explicitly by the caller.
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
    /**
     * `user` is only present on the initial sign-in call, and — because we
     * have an adapter configured — it's the actual Prisma `User` row (real
     * cuid `id`), not the raw Google profile. Persist that id into the JWT
     * so every subsequent request can address the database with it.
     */
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    /** Expose that id on the session object (typed via types/next-auth.d.ts). */
    async session({ session, token }) {
      if (session.user && typeof token.uid === "string") {
        session.user.id = token.uid;
      }
      return session;
    },
  },
});
