import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { withAuth } from "next-auth/middleware";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Define protected routes
const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login"];

export default withAuth(
  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("auth-token")?.value;

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Check if the current path is an auth route
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // If accessing protected route
    if (isProtectedRoute) {
      if (!token) {
        // No token, redirect to login
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      try {
        // Verify token
        jwt.verify(token, JWT_SECRET);
        // Token is valid, allow access
        return NextResponse.next();
      } catch (error) {
        // Invalid token, redirect to login and clear cookie
        const loginUrl = new URL("/login", request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set({
          name: "auth-token",
          value: "",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 0,
          path: "/",
        });
        return response;
      }
    }

    // If accessing auth route while authenticated
    if (isAuthRoute && token) {
      try {
        jwt.verify(token, JWT_SECRET);
        // Valid token, redirect to dashboard
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
      } catch (error) {
        // Invalid token, allow access to login
        return NextResponse.next();
      }
    }

    // Allow access to public routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
