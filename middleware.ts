import { NextResponse } from "next/server";

import { auth } from "@/auth";

/**
 * Route protection.
 *
 * `/` (landing page) is the only public route. Everything under
 * `/dashboard` (and any future authenticated section) requires a session;
 * unauthenticated visitors are bounced back to `/`.
 *
 * We intentionally do NOT protect `/api/auth/*` — NextAuth needs those
 * routes reachable pre-authentication — the matcher below excludes them.
 */
export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtectedRoute = pathname.startsWith("/dashboard");

  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api/auth (NextAuth internals)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico and other static assets
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
