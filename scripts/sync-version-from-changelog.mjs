#!/usr/bin/env node
// Reads the latest released version from CHANGELOG.md and applies it to:
//   - package.json
//   - src/lib/banner.ts
//   - .claude-plugin/marketplace.json (both metadata.version and plugins[0].version)
//
// Source of truth: CHANGELOG.md. The first H2 heading that matches "## [X.Y.Z]"
// (skipping "## [Unreleased]") is the current released version.
//
// Modes:
//   node scripts/sync-version-from-changelog.mjs           → apply (writes files)
//   node scripts/sync-version-from-changelog.mjs --check   → exit 1 if drift
//
// Used by:
//   - /npm-publish skill (after CHANGELOG is updated)
//   - .github/workflows/release-guard.yml (in --check mode)

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");

function readFile(relPath) {
  return readFileSync(resolve(repoRoot, relPath), "utf8");
}

function writeFile(relPath, contents) {
  writeFileSync(resolve(repoRoot, relPath), contents, "utf8");
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

// 1. Parse CHANGELOG.md → find latest released version (skip Unreleased).
const changelog = readFile("CHANGELOG.md");
const match = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m);
if (!match) {
  fail("CHANGELOG.md has no released version heading like '## [X.Y.Z]'.");
}
const changelogVersion = match[1];

// 2. Read other sources of version.
const pkg = JSON.parse(readFile("package.json"));
const banner = readFile("src/lib/banner.ts");
const bannerMatch = banner.match(/const VERSION = "(\d+\.\d+\.\d+)"/);
if (!bannerMatch) fail("src/lib/banner.ts: VERSION constant not found.");
const bannerVersion = bannerMatch[1];

const market = JSON.parse(readFile(".claude-plugin/marketplace.json"));
const metadataVersion = market.metadata?.version;
const pluginVersion = market.plugins?.[0]?.version;

// 3. Compare.
const sources = {
  "package.json": pkg.version,
  "src/lib/banner.ts": bannerVersion,
  ".claude-plugin/marketplace.json#metadata.version": metadataVersion,
  ".claude-plugin/marketplace.json#plugins[0].version": pluginVersion,
};
const drifts = Object.entries(sources).filter(([, v]) => v !== changelogVersion);

if (checkOnly) {
  if (drifts.length === 0) {
    console.log(`✓ All version sources match CHANGELOG (${changelogVersion}).`);
    process.exit(0);
  }
  console.error(`✗ Version drift — CHANGELOG says ${changelogVersion}, but:`);
  for (const [src, v] of drifts) console.error(`  - ${src}: ${v}`);
  console.error("");
  console.error("Run: node scripts/sync-version-from-changelog.mjs");
  process.exit(1);
}

// 4. Apply.
if (drifts.length === 0) {
  console.log(`✓ Already in sync at ${changelogVersion}.`);
  process.exit(0);
}

pkg.version = changelogVersion;
writeFile("package.json", JSON.stringify(pkg, null, 2) + "\n");

const newBanner = banner.replace(
  /const VERSION = "\d+\.\d+\.\d+"/,
  `const VERSION = "${changelogVersion}"`,
);
writeFile("src/lib/banner.ts", newBanner);

market.metadata.version = changelogVersion;
market.plugins[0].version = changelogVersion;
writeFile(
  ".claude-plugin/marketplace.json",
  JSON.stringify(market, null, 2) + "\n",
);

console.log(`✓ Synced all sources to ${changelogVersion}.`);
for (const [src, v] of drifts) console.log(`  - ${src}: ${v} → ${changelogVersion}`);
