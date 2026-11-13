/**
 * URL filter for user-authored markdown.
 *
 * The markdown preview library accepts a `urlTransform` prop and uses it for
 * links and images. Without a filter, a contributor can submit
 * `[click](javascript:alert(1))` and the rendered link executes in the page.
 * Only http, https, mailto, and same-origin relative paths are allowed.
 */
export function safeUrlTransform(url: string): string {
  const value = (url || "").trim();
  if (!value) return "";

  if (
    value.startsWith("#") ||
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.startsWith("../")
  ) {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:") {
      return value;
    }
  } catch {
    // Relative URLs without a leading slash are safe and handled below.
  }

  // A bare path such as `notes/interview.md` is relative and safe.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return value;
  }

  return "";
}
