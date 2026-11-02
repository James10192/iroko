#!/usr/bin/env node
"use strict";

// Claude Code PreToolUse prototype. Fail-closed for covered tool classes.
// This is NOT a sandbox: independent write-capable tools must also be restricted.
const { projectRoot, authorized, relativePath, disallowSensitiveSource } = require("./core.cjs");

function deny(reason) {
  console.error("IROKO CONTEXT GATE BLOCK: " + reason);
  process.exitCode = 2;
}

function safeReadOnlyBash(command) {
  if (typeof command !== "string" || /[\r\n;&|><\x60$(){}\\]/.test(command)) return false;
  if (/^node\s+prototypes\/context-gate\/prepare\.cjs\s+[A-Za-z0-9_.:#-]{3,80}$/.test(command)) {
    return true;
  }
  // Exact read-only forms only. Never accept arbitrary flags (--output, --pre,
  // shell functions, subshells) or chained commands as "read only".
  const readOnly = [
    /^pwd$/,
    /^ls(?: -la)?$/,
    /^git status(?: --short)?$/,
    /^git diff(?: --stat| --name-only)?$/,
    /^git rev-parse HEAD$/,
    /^git log -1 --oneline$/,
    /^git show --stat$/,
    /^cat [A-Za-z0-9_./-]+$/,
    /^rg [A-Za-z0-9_./-]+ [A-Za-z0-9_./-]+$/
  ];
  if (!readOnly.some((pattern) => pattern.test(command))) return false;
  const match = command.match(/^(?:cat|rg [A-Za-z0-9_./-]+) ([A-Za-z0-9_./-]+)$/);
  if (match) {
    try {
      const rel = relativePath(projectRoot(), match[1]);
      if (disallowSensitiveSource(rel) || rel.startsWith(".iroko/") ||
          rel.startsWith(".git/")) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function evaluate(event) {
  if (!event || typeof event.tool_name !== "string") {
    throw new Error("Invalid hook payload");
  }
  const name = event.tool_name;
  const input = event.tool_input || {};
  if (name === "Bash") {
    if (!safeReadOnlyBash(input.command)) {
      throw new Error("Bash is restricted to allowlisted read-only commands; use scoped file tools for writes");
    }
    return;
  }
  if (["Write", "Edit", "MultiEdit", "NotebookEdit"].includes(name)) {
    authorized(projectRoot(), input.file_path || input.notebook_path, event.session_id);
    return;
  }
  throw new Error("Unclassified tool requires an explicit policy: " + name);
}

let data = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  data += chunk;
  if (data.length > 128000) deny("Hook event exceeds size limit");
});
process.stdin.on("end", () => {
  if (process.exitCode === 2) return;
  try {
    evaluate(JSON.parse(data));
  } catch (error) {
    deny(error.message);
  }
});
