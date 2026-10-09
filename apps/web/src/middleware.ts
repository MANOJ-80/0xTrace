import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";

const BOT_USER_AGENTS = [
  "facebookexternalhit",
  "whatsapp",
  "twitterbot",
  "linkedinbot",
  "discordbot",
  "telegrambot",
  "slackbot",
  "googlebot",
  "bingbot",
  "applebot",
  "duckduckbot",
];

function isCrawler(req: NextRequest): boolean {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;
    const token = req.nextauth.token;

    // Strict check for admin routes
    if (path.startsWith("/admin") && !token?.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const crawler = isCrawler(req);

        // Allow social crawlers to access metadata & unfurl preview cards
        if (crawler) {
          return true;
        }
        // Allow direct access to OG images and metadata endpoints
        if (
          pathname.includes("opengraph-image") ||
          pathname.includes("twitter-image")
        ) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/contribute",
    "/upload",
    "/admin/:path*",
    "/experiences/:path+",
    "/questions",
    "/analytics",
  ],
};
