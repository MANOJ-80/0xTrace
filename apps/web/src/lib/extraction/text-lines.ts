/**
 * Line-oriented view of an extracted PDF.
 *
 * The text layer keeps layout, so the parser can reason about whole lines
 * instead of regexing a flattened string. Every downstream module works on
 * these lines.
 */

export interface DocLine {
  index: number;
  page: number;
  text: string;
  indent: number;
}

const ZERO_WIDTH = /[\u200b-\u200d\u2060\ufeff]/g;

export function toLines(raw: string): DocLine[] {
  const pages = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\f");
  const lines: DocLine[] = [];
  let index = 0;

  pages.forEach((pageText, pageIndex) => {
    for (const rawLine of pageText.split("\n")) {
      const text = rawLine.replace(ZERO_WIDTH, "").replace(/\s+$/g, "");
      lines.push({
        index: index++,
        page: pageIndex + 1,
        text,
        indent: text.length - text.trimStart().length,
      });
    }
  });

  return lines;
}

export function collapse(value: string): string {
  return value.replace(ZERO_WIDTH, "").replace(/\s+/g, " ").trim();
}

export function joinLines(lines: DocLine[], separator = "\n"): string {
  return lines
    .map((line) => line.text)
    .join(separator)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isBlank(line: DocLine): boolean {
  return line.text.trim().length === 0;
}

export function nextNonBlank(lines: DocLine[], start: number): number {
  for (let index = start; index < lines.length; index++) {
    if (!isBlank(lines[index])) return index;
  }
  return -1;
}

export function previousNonBlank(lines: DocLine[], start: number): number {
  for (let index = start; index >= 0; index--) {
    if (!isBlank(lines[index])) return index;
  }
  return -1;
}

/** Strip a leading bullet or list marker. */
export function stripBullet(value: string): string {
  return value
    .replace(/^[\s\u2022\u25cf\u25cb\u25aa\u2023\u2043\u2219\u27a2\uf0b7\-–—*]+/, "")
    .trim();
}
