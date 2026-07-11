import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/compare", "/overlay", "/u"];

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isPublicPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (isPublicPage) {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const pathname = req.nextUrl.pathname;
        const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
        const isPublicPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

        if (isAuthPage || isPublicPage) {
          return true;
        }

        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/matches/:path*",
    "/profile/:path*",
    "/leaderboard/:path*",
    "/ai-coach/:path*",
    "/prediction/:path*",
    "/goals/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/compare/:path*",
    "/overlay/:path*",
    "/login",
    "/register",
  ],
};
