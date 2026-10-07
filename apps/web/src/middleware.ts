import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/api/auth/signin", // Let next-auth handle the redirect to google directly if possible, or back to home
    },
  }
);

export const config = {
  matcher: [
    "/contribute",
    "/upload",
    "/admin/:path*",
    "/experiences/:id",
  ],
};
