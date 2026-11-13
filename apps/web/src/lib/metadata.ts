import type { Metadata } from "next";

/**
 * Robots directives for pages that require a session.
 *
 * The middleware redirects crawlers away from these routes, but a page-level
 * noindex is the second guard. It also keeps a stale URL out of search results
 * if the route is ever reachable without a session.
 */
export const PRIVATE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
};
