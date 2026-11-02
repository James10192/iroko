#!/usr/bin/env node
"use strict";

// Deterministic, repository-local check. No AI model and no claims of semantic proof.
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readPolicy, relativePath } = require("./core.cjs");

const DEFAULT_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".php", ".py"];

function verify(root, trustedPolicy = null) {
  const policy = trustedPolicy || readPolicy(root).policy;
  const rules = policy.forbiddenPatterns || [];
  if (!Array.isArray(rules)) throw new Error("forbiddenPatterns must be an array");
  const violations = [];

  for (const rule of rules) {
    if (!rule || typeof rule.pathPrefix !== "string" ||
        typeof rule.literal !== "string" || !rule.literal) {
      throw new Error("Each forbidden pattern needs pathPrefix and literal");
    }
    const prefix = rule.pathPrefix.endsWith("/")
      ? rule.pathPrefix
      : rule.pathPrefix + "/";
    const rel = relativePath(root, prefix + "_scope_check_");
    const directory = path.join(root, rel, "..");
    if (!fs.existsSync(directory)) {
      throw new Error("Required policy scan directory is missing: " + prefix);
    }

    function visit(target) {
      if (fs.lstatSync(target).isSymbolicLink()) {
        throw new Error("Symlink in policy scan: " + target);
      }
      if (fs.statSync(target).isDirectory()) {
        for (const item of fs.readdirSync(target)) {
          if (item === "node_modules" || item === ".git") continue;
          visit(path.join(target, item));
        }
        return;
      }
      if (!DEFAULT_EXTENSIONS.includes(path.extname(target))) return;
      if (fs.statSync(target).size > 512000) {
        throw new Error("Source too large for a complete check: " + target);
      }
      if (fs.readFileSync(target, "utf8").includes(rule.literal)) {
        violations.push(path.relative(root, target) + ": " +
          (rule.id || rule.literal));
      }
    }
    visit(directory);
  }
  return violations;
}

if (require.main === module) {
  try {
    const violations = verify(projectRoot());
    if (violations.length) {
      console.error("IROKO context policy violations:\n" + violations.join("\n"));
      process.exitCode = 1;
    } else {
      console.log("IROKO context policy: deterministic checks passed.");
    }
  } catch (error) {
    console.error("IROKO verification failed: " + error.message);
    process.exitCode = 1;
  }
}
module.exports = { verify };
