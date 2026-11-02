#!/usr/bin/env node
"use strict";

// Run this checker from a trusted base-branch checkout. Treat candidate as DATA.
// Never require(), build, install, source or execute any file from candidate.
const fs = require("node:fs");
const path = require("node:path");
const { readPolicy } = require("./core.cjs");
const { verify } = require("./verify.cjs");

function check(trustedRoot, candidateRoot) {
  if (!trustedRoot || !candidateRoot) {
    throw new Error("Usage: node ci-check.cjs TRUSTED_BASE_DIRECTORY CANDIDATE_DIRECTORY");
  }
  const base = fs.realpathSync(path.resolve(trustedRoot));
  const candidate = fs.realpathSync(path.resolve(candidateRoot));
  if (base === candidate) throw new Error("Trusted base and candidate must be separate checkouts");

  const { policy, raw } = readPolicy(base);
  const proposed = fs.readFileSync(path.join(candidate, "iroko.context.json"), "utf8");
  if (proposed !== raw) {
    throw new Error("Candidate policy differs from approved base-branch policy; review separately");
  }

  const violations = verify(candidate, policy);
  if (violations.length) {
    throw new Error("Approved project policy violations:\n" + violations.join("\n"));
  }
  console.log("IROKO trusted-base policy check passed (literal rules only).");
}

if (require.main === module) {
  try {
    check(process.argv[2], process.argv[3]);
  } catch (error) {
    console.error("IROKO CI gate denied: " + error.message);
    process.exitCode = 1;
  }
}

module.exports = { check };
