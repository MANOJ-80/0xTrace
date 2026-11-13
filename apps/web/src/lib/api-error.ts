import { NextResponse } from "next/server";

/**
 * Log the real error on the server and return a stable message to the client.
 *
 * Database and provider errors can contain connection strings, collection
 * names, or provider responses. Those belong in the server log, not in an API
 * response.
 */
export function serverError(
  scope: string,
  error: unknown,
  message = "Request failed"
): NextResponse {
  console.error(`[${scope}]`, error);
  return NextResponse.json({ error: message }, { status: 500 });
}
