import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// This program is the entrypoint for the one-line joke bounty.
// It reads the joke stored beside this file, checks it against
// the bounty gate, and copies its exact bytes to the grader
// output directory without adding or removing anything.

const MAX_CHARS = 140;
const MIN_CHARS = 1;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const entryPath = join(scriptDir, "entry.txt");

function fail(message: string): never {
  console.error(`entry check failed: ${message}`);
  process.exit(1);
}

function countChars(text: string): number {
  return [...text].length;
}

function main(): void {
  let raw: Buffer;
  try {
    raw = readFileSync(entryPath);
  } catch (error) {
    fail(`could not read entry.txt next to main.ts (${error})`);
  }

  const text = raw!.toString("utf-8");

  if (text.trim().length === 0) {
    fail("entry.txt is empty or only whitespace");
  }

  const chars = countChars(text);
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    fail(`entry is ${chars} characters, gate needs ${MIN_CHARS}-${MAX_CHARS}`);
  }

  if (text !== text.trim()) {
    fail("entry must not start or end with whitespace");
  }

  if (text.includes("\n") || text.includes("\r")) {
    fail("entry must be a single line with no line breaks");
  }

  const outputDir = process.env.MAKEFUN_OUTPUT_DIR
    ? process.env.MAKEFUN_OUTPUT_DIR
    : join(scriptDir, "out");
  mkdirSync(outputDir, { recursive: true });

  const outputPath = join(outputDir, "entry.txt");
  writeFileSync(outputPath, raw!);

  console.log(`wrote ${chars} characters to ${outputPath}`);
}

main();
