/**
 * Pure-JS PDF text extraction using Mozilla pdf.js (pdfjs-dist).
 *
 * Works on Vercel, Cloudflare, and any Node.js runtime without native
 * binaries. Produces page-separated text with form-feed delimiters so
 * the downstream line parser can distinguish pages.
 */

import type { TextItem } from "pdfjs-dist/types/src/display/api";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export interface JsPdfResult {
  text: string;
  pageCount: number;
}

/**
 * Extract text from a PDF buffer using pdfjs-dist.
 *
 * Each page's text items are sorted top-to-bottom, left-to-right, then
 * joined with newlines. Pages are separated by form-feed (\f) characters
 * so the text-lines module can detect page boundaries.
 */
export async function extractPdfWithJs(buffer: Buffer): Promise<JsPdfResult> {
  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    // Disable unnecessary features for text-only extraction
    disableFontFace: true,
  }).promise;

  const pageTexts: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();

    // Each item has a transform [a, b, c, d, tx, ty] where tx/ty are
    // the position on the page.  We group items into lines by y-coordinate
    // (with a small tolerance), then sort lines top-to-bottom and items
    // within each line left-to-right.
    const items = content.items.filter(
      (item): item is TextItem => "str" in item && item.str.length > 0
    );

    if (items.length === 0) {
      pageTexts.push("");
      continue;
    }

    // Group by y-coordinate (items within ~2 units share a line)
    const lineMap = new Map<number, { x: number; str: string }[]>();
    const LINE_TOLERANCE = 2;

    for (const item of items) {
      const tx = item.transform[4];
      const ty = item.transform[5];

      // Find an existing line bucket within tolerance
      let bucketY: number | null = null;
      for (const key of lineMap.keys()) {
        if (Math.abs(key - ty) <= LINE_TOLERANCE) {
          bucketY = key;
          break;
        }
      }

      if (bucketY !== null) {
        lineMap.get(bucketY)!.push({ x: tx, str: item.str });
      } else {
        lineMap.set(ty, [{ x: tx, str: item.str }]);
      }
    }

    // Sort lines top-to-bottom (higher y = higher on page in PDF coords)
    const sortedLines = Array.from(lineMap.entries())
      .sort(([ya], [yb]) => yb - ya)
      .map(([, fragments]) => {
        // Sort fragments left-to-right within each line
        fragments.sort((a, b) => a.x - b.x);

        // Join fragments, inserting spaces when there's a horizontal gap
        let line = "";
        let prevEnd = -Infinity;
        for (const frag of fragments) {
          // If there's a significant gap, add a space
          if (line.length > 0 && frag.x - prevEnd > 2) {
            if (!line.endsWith(" ") && !frag.str.startsWith(" ")) {
              line += " ";
            }
          }
          line += frag.str;
          // Estimate where this fragment ends (rough but functional)
          prevEnd = frag.x + frag.str.length * 5;
        }
        return line;
      });

    pageTexts.push(sortedLines.join("\n"));
  }

  // Join pages with form-feed so toLines() can detect page boundaries.
  const text = pageTexts.join("\f");

  return { text, pageCount: doc.numPages };
}
