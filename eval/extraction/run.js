#!/usr/bin/env node
/**
 * Deterministic extraction eval.
 *
 * Compiles the TypeScript chunker, extracts text through the same Python layer
 * the API uses, and compares the result with expectations.json. This measures
 * the regex/document-model pass only; the LLM repair stage is exercised
 * manually because free-tier quotas make it unsuitable for a test loop.
 *
 *   node eval/extraction/run.js
 *   node eval/extraction/run.js --verbose
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "../..");
const WEB = path.join(ROOT, "apps/web");
const BUILD = path.join(__dirname, ".build");
const TS_CONFIG = path.join(__dirname, "tsconfig.json");
const EXPECTATIONS = path.join(__dirname, "expectations.json");
const PYTHON = path.join(ROOT, "apps/api/.venv/bin/python");
const API_DIR = path.join(ROOT, "apps/api");

const verbose = process.argv.includes("--verbose");

function compile() {
  const tsc = path.join(WEB, "node_modules/.bin/tsc");
  if (!fs.existsSync(tsc)) {
    throw new Error(`TypeScript compiler not found at ${tsc}. Run npm install in apps/web.`);
  }
  fs.rmSync(BUILD, { recursive: true, force: true });
  const result = spawnSync(tsc, ["-p", TS_CONFIG], { cwd: ROOT, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`TypeScript build failed:\n${result.stdout || ""}${result.stderr || ""}`);
  }
}

const PYTHON_SCRIPT = [
  "import sys, json",
  "sys.path.insert(0, sys.argv[1])",
  "from app.pdf_text import extract_pdf_text",
  'with open(sys.argv[2], "rb") as handle:',
  "    result = extract_pdf_text(handle.read())",
  'print(json.dumps({"text": result.text, "method": result.method, "pages": result.page_count}))',
].join("\n");

function extractText(file) {
  const absolute = path.join(ROOT, file);
  if (fs.existsSync(PYTHON)) {
    const result = spawnSync(PYTHON, ["-c", PYTHON_SCRIPT, API_DIR, absolute], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.status === 0 && result.stdout.trim()) {
      const parsed = JSON.parse(result.stdout);
      return { ...parsed, method: `python:${parsed.method}` };
    }
    if (result.status === 0) {
      throw new Error(`Python extraction returned no output for ${file}`);
    }
    if (verbose) {
      console.warn(`Python extraction failed for ${file}: ${result.stderr}`);
    }
  }

  const fallback = spawnSync("pdftotext", ["-layout", absolute, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (fallback.status !== 0 || !fallback.stdout.trim()) {
    throw new Error(`No text extractor produced output for ${file}`);
  }
  return { text: fallback.stdout, method: "pdftotext", pages: 0 };
}

function normalize(value) {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().toLowerCase()
    : value;
}

function contains(value, expected) {
  return normalize(value)?.includes(normalize(expected) ?? "");
}

function same(actual, expected) {
  return normalize(actual) === normalize(expected);
}

function checkCase(file, expected, actual) {
  const failures = [];
  const checks = [];

  const record = (name, passed, got, want) => {
    checks.push({ name, passed, got, want });
    if (!passed) failures.push({ name, got, want });
  };

  const programmatic = actual.programmatic;

  if (expected.company !== undefined) {
    if (expected.company === null && expected.company_llm) {
      record(
        "company",
        programmatic.company_name === null ||
          contains(programmatic.company_name, expected.company_llm),
        programmatic.company_name,
        `null (LLM: ${expected.company_llm})`
      );
    } else {
      record("company", same(programmatic.company_name, expected.company), programmatic.company_name, expected.company);
    }
  } else if (expected.company_contains) {
    record(
      "company",
      contains(programmatic.company_name, expected.company_contains),
      programmatic.company_name,
      `contains "${expected.company_contains}"`
    );
  }

  if (expected.candidate !== undefined) {
    if (expected.candidate === null && expected.candidate_llm) {
      record(
        "candidate",
        programmatic.candidate_name === null ||
          contains(programmatic.candidate_name, expected.candidate_llm),
        programmatic.candidate_name,
        `null (LLM: ${expected.candidate_llm})`
      );
    } else {
      record(
        "candidate",
        same(programmatic.candidate_name, expected.candidate),
        programmatic.candidate_name,
        expected.candidate
      );
    }
  }

  if (expected.role !== undefined) {
    record("role", same(programmatic.role, expected.role), programmatic.role, expected.role);
  }

  if (expected.ctc !== undefined) {
    record("ctc", same(programmatic.ctc, expected.ctc), programmatic.ctc, expected.ctc);
  }

  if (expected.rounds !== undefined) {
    record("rounds", programmatic.round_count === expected.rounds, programmatic.round_count, expected.rounds);
  }

  if (expected.outcome_status !== undefined) {
    record(
      "outcome_status",
      same(programmatic.outcome_status, expected.outcome_status),
      programmatic.outcome_status,
      expected.outcome_status
    );
  }

  if (expected.selected !== undefined) {
    record(
      "selected",
      programmatic.selected_count === expected.selected,
      programmatic.selected_count,
      expected.selected
    );
  }

  if (expected.total !== undefined) {
    record(
      "total",
      programmatic.total_candidates === expected.total,
      programmatic.total_candidates,
      expected.total
    );
  }

  if (expected.tips !== undefined) {
    const hasTips = Boolean(actual.tips_chunk && actual.tips_chunk.trim());
    record("tips", hasTips === expected.tips, hasTips, expected.tips);
  }

  // Structural invariants every document must satisfy.
  record("header", Boolean(actual.header_chunk.trim()), actual.header_chunk.length, "non-empty");
  const sequences = actual.round_chunks.map((round) => round.sequence);
  record(
    "sequence",
    sequences.every((value, index) => value === index + 1),
    sequences.join(","),
    "1..n"
  );
  record(
    "non-empty rounds",
    actual.round_chunks.every((round) => round.raw.trim().length > 0),
    actual.round_chunks.filter((round) => !round.raw.trim()).length,
    0
  );

  return { file, checks, failures, actual };
}

function main() {
  compile();
  const { chunkDocument } = require(path.join(BUILD, "lib/chunker.js"));
  const expectations = JSON.parse(fs.readFileSync(EXPECTATIONS, "utf8"));

  const groups = [
    ["Tuning set", expectations.tuning],
    ["Holdout set", expectations.holdout],
  ];

  let totalChecks = 0;
  let totalFailures = 0;
  let evaluated = 0;

  for (const [label, files] of groups) {
    console.log(`\n${label}`);
    for (const file of files) {
      const expected = expectations.cases[file];
      if (!expected) {
        console.log(`  ? ${path.basename(file)} (no expectations)`);
        continue;
      }
      if (!fs.existsSync(path.join(ROOT, file))) {
        console.log(`  - ${path.basename(file)} (fixture not present, skipped)`);
        continue;
      }

      const { text, method, pages } = extractText(file);
      const actual = chunkDocument(text);
      evaluated++;
      const result = checkCase(file, expected, actual);
      totalChecks += result.checks.length;
      totalFailures += result.failures.length;

      const mark = result.failures.length === 0 ? "✓" : "✗";
      const summary = [
        `rounds=${actual.programmatic.round_count}`,
        `outcome=${actual.programmatic.outcome_status ?? "null"}`,
        `${actual.programmatic.selected_count ?? "?"}/${actual.programmatic.total_candidates ?? "?"}`,
      ].join(" ");
      console.log(
        `  ${mark} ${path.basename(file).padEnd(48)} ${summary}  [${method}, ${pages || "?"}p]`
      );

      for (const failure of result.failures) {
        console.log(
          `      ${failure.name}: expected ${JSON.stringify(failure.want)}, got ${JSON.stringify(failure.got)}`
        );
      }

      if (verbose) {
        console.log(
          `      company=${JSON.stringify(actual.programmatic.company_name)} candidate=${JSON.stringify(
            actual.programmatic.candidate_name
          )} role=${JSON.stringify(actual.programmatic.role)} ctc=${JSON.stringify(actual.programmatic.ctc)}`
        );
        for (const round of actual.round_chunks) {
          console.log(
            `      R${round.sequence} ${JSON.stringify(round.detected_name)} type=${round.detected_type} raw=${round.raw.length}c`
          );
        }
      }
    }
  }

  console.log(
    `\nSummary: ${totalChecks - totalFailures}/${totalChecks} checks passed across ${evaluated} files`
  );
  if (totalFailures > 0) process.exitCode = 1;
}

main();
