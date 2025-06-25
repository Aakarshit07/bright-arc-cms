import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuthPage = pathname === "/login" || pathname === "/";
    const isDashboard = pathname.startsWith("/dashboard");

    // If user is authenticated and tries to access / or /login, redirect to /dashboard
    if (req.nextauth.token && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If user is not authenticated and tries to access /dashboard, redirect to /login
    if (!req.nextauth.token && isDashboard) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Match /, /login, and /dashboard routes
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
