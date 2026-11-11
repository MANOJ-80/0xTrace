import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { extractExperience } from "./groq-extractor";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { extractPdfWithJs } from "@/lib/pdf-extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_BYTES = Math.floor(4.5 * 1024 * 1024);
const PDF_TEXT_TIMEOUT_MS = 30_000;

interface PdfTextResult {
  text: string;
  pageCount: number;
  method: "layout" | "native" | "ocr" | "pdftotext" | "unpdf";
}

/* ------------------------------------------------------------------ */
/*  JS extraction (unpdf) — runs natively on Vercel serverless         */
/* ------------------------------------------------------------------ */

async function extractWithJs(pdfBuffer: Buffer): Promise<PdfTextResult | null> {
  try {
    const result = await extractPdfWithJs(pdfBuffer);
    if (result.text.trim().length > 0) {
      return { text: result.text, pageCount: result.pageCount, method: "unpdf" };
    }
  } catch (error: any) {
    console.warn(`[PDF] unpdf extraction failed:`, error);
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Process helper — streams the PDF through stdin, never touches disk */
/* ------------------------------------------------------------------ */

function runWithInput(
  command: string,
  args: string[],
  input: Buffer,
  options: { cwd?: string; env?: NodeJS.ProcessEnv; timeoutMs: number }
): Promise<{ stdout: Buffer; stderr: string }> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      reject(new Error(`${command} timed out after ${Math.round(options.timeoutMs / 1000)}s`));
    }, options.timeoutMs);

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) {
        reject(error);
        return;
      }
      resolve({
        stdout: Buffer.concat(stdout),
        stderr: Buffer.concat(stderr).toString("utf-8"),
      });
    };

    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));

    child.on("error", (error) => finish(error));
    child.on("close", (code) => {
      if (code === 0) {
        finish();
      } else {
        const detail = Buffer.concat(stderr).toString("utf-8").trim().slice(0, 400);
        finish(new Error(`${command} exited with code ${code}${detail ? `: ${detail}` : ""}`));
      }
    });

    // A dead child can emit EPIPE; the close/error handlers report the real cause.
    child.stdin.on("error", () => {});
    child.stdin.end(input);
  });
}

const PYTHON_SCRIPT = `
import sys, json
from app.pdf_text import extract_pdf_text

content = sys.stdin.buffer.read()
result = extract_pdf_text(content)
print(json.dumps({"text": result.text, "page_count": result.page_count, "method": result.method}))
`;

function resolvePythonCandidates(): string[] {
  const candidates = [
    process.env.PDF_PYTHON,
    path.resolve(process.cwd(), "../../apps/api/.venv/bin/python"),
    path.resolve(process.cwd(), "../api/.venv/bin/python"),
    "python3",
    "python",
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(candidates));
}

function resolveApiDir(): string | null {
  const candidates = [
    path.resolve(process.cwd(), "../../apps/api"),
    path.resolve(process.cwd(), "../api"),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isDirectory()) return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

interface PythonAttempt {
  result: PdfTextResult | null;
  /** Present when Python ran but rejected the PDF itself. */
  inputError?: string;
}

async function extractWithPython(pdfBuffer: Buffer): Promise<PythonAttempt> {
  const apiDir = resolveApiDir();
  const cwd = apiDir || process.cwd();
  const errors: string[] = [];

  for (const python of resolvePythonCandidates()) {
    try {
      const { stdout } = await runWithInput(python, ["-c", PYTHON_SCRIPT], pdfBuffer, {
        cwd,
        env: apiDir ? { ...process.env, PYTHONPATH: apiDir } : process.env,
        timeoutMs: PDF_TEXT_TIMEOUT_MS,
      });

      const parsed = JSON.parse(stdout.toString("utf-8")) as {
        text?: string;
        page_count?: number;
        method?: string;
      };

      if (parsed.text?.trim()) {
        const method =
          parsed.method === "native" || parsed.method === "ocr"
            ? parsed.method
            : "layout";
        return {
          result: {
            text: parsed.text,
            pageCount: parsed.page_count || 0,
            method,
          },
        };
      }

      // Python works; the PDF itself has no text layer. Let the caller try
      // other methods before reporting this.
      return {
        result: null,
        inputError:
          "No readable text was found. The PDF may be image-based or scanned.",
      };
    } catch (error: any) {
      const message = error.message || "";

      // PdfExtractionError signals an unreadable or encrypted PDF.
      const known = message.match(/PdfExtractionError:\s*([^\n]+)/)?.[1]?.trim();
      if (known) {
        return { result: null, inputError: known };
      }

      errors.push(`${python}: ${message.slice(0, 220)}`);
    }
  }

  if (errors.length) {
    console.warn(`[PDF] Python text extraction failed: ${errors.join(" | ")}`);
  }
  return { result: null };
}

async function extractWithPdftotext(pdfBuffer: Buffer): Promise<PdfTextResult | null> {
  try {
    const { stdout } = await runWithInput("pdftotext", ["-layout", "-", "-"], pdfBuffer, {
      timeoutMs: PDF_TEXT_TIMEOUT_MS,
    });
    const text = stdout.toString("utf-8").trim();
    if (text.length > 0) {
      return { text, pageCount: 0, method: "pdftotext" };
    }
  } catch (error: any) {
    console.warn(`[PDF] pdftotext fallback failed: ${error.message?.slice(0, 200)}`);
  }
  return null;
}

/**
 * Extraction priority:
 *   1. unpdf (pure JS, fast, zero external dependencies — works on Vercel & local)
 *   2. Python (OCR fallback for image-based PDFs, local dev only)
 *   3. pdftotext binary (layout fallback, local dev only)
 */
async function extractPdfText(pdfBuffer: Buffer): Promise<PdfTextResult> {
  // Pure JS first — works identically in local dev and on Vercel serverless
  const jsResult = await extractWithJs(pdfBuffer);
  if (jsResult) {
    return jsResult;
  }

  // Fall back to Python if available (e.g. for OCR)
  const python = await extractWithPython(pdfBuffer);
  if (python.result) return python.result;

  // Fall back to pdftotext binary if available
  const pdftotext = await extractWithPdftotext(pdfBuffer);
  if (pdftotext) {
    return pdftotext;
  }

  if (python.inputError) {
    throw new Error(python.inputError);
  }

  throw new Error(
    "Could not extract text from this PDF. The file may be image-only or corrupted."
  );
}

/* ------------------------------------------------------------------ */
/*  Route                                                              */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    const blob = file as File;
    const originalName = blob.name || "uploaded.pdf";
    const filename = path.basename(originalName).replace(/[^\w.\- ()]/g, "_");

    if (blob.size === 0) {
      return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
    }
    if (blob.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `PDF is too large (${(blob.size / 1024 / 1024).toFixed(1)} MB). Limit is 10 MB.` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await blob.arrayBuffer());

    // `File.type` can be empty or wrong; verify the actual PDF signature.
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      return NextResponse.json(
        { error: "That file is not a PDF.", detail: "The file does not start with a %PDF- header." },
        { status: 415 }
      );
    }

    let extraction: PdfTextResult;
    try {
      extraction = await extractPdfText(buffer);
    } catch (error: any) {
      return NextResponse.json(
        {
          error: "Could not read the PDF",
          detail:
            error.message ||
            "The PDF may be image-only or encrypted. Try a text-based PDF.",
        },
        { status: 422 }
      );
    }

    if (!extraction.text || extraction.text.trim().length < 50) {
      return NextResponse.json(
        {
          error: "Could not extract enough text from the PDF",
          detail:
            "The PDF appears to be image-based or empty. Upload a text-based PDF, or scan it with OCR first.",
        },
        { status: 422 }
      );
    }

    try {
      const result = await extractExperience(
        extraction.text,
        filename,
        extraction.pageCount
      );

      result.pipeline = {
        ...(result.pipeline || {
          providers: [],
          warnings: [],
          rounds_detected: result.experiences[0]?.rounds?.length || 0,
          page_count: extraction.pageCount,
          text_characters: extraction.text.length,
          duration_ms: 0,
        }),
        method: extraction.method,
      };

      return NextResponse.json(result);
    } catch (error: any) {
      console.error("[Extract] pipeline failed:", error);
      return NextResponse.json(
        {
          error: "Extraction failed",
          detail:
            error.message ||
            "The LLM provider chain did not return usable data. Try again in a minute.",
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("[Extract] unexpected error:", error);
    return NextResponse.json(
      { error: "Extraction pipeline error", detail: error.message },
      { status: 500 }
    );
  }
}
