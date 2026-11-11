/**
 * Pure-JS PDF text extraction using unpdf.
 *
 * Runs natively on Vercel Serverless and Edge functions without native
 * canvas dependencies or external worker threads. Produces page-separated
 * text with form-feed delimiters so the downstream line parser can detect
 * page boundaries.
 */

import { extractText, getDocumentProxy } from "unpdf";

export interface JsPdfResult {
  text: string;
  pageCount: number;
}

export async function extractPdfWithJs(buffer: Buffer): Promise<JsPdfResult> {
  const data = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(data);
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  const joinedText = Array.isArray(text) ? text.join("\f") : String(text || "");

  return {
    text: joinedText,
    pageCount: totalPages || 1,
  };
}
