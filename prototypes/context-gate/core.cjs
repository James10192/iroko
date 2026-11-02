"use strict";

// Project-local context evidence, not a security boundary by itself.
// Every policy value comes from the repository being inspected.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");

function projectRoot() {
  return fs.realpathSync(process.env.CLAUDE_PROJECT_DIR || process.cwd());
}

function relativePath(root, candidate) {
  if (typeof candidate !== "string" || !candidate.trim()) {
    throw new Error("A non-empty file path is required");
  }
  const absolute = path.resolve(root, candidate);
  const relative = path.relative(root, absolute);
  if (!relative || relative === ".." || relative.startsWith(".." + path.sep) || path.isAbsolute(relative)) {
    throw new Error("Path escapes project root or points to its root");
  }

  // Refuse symlinks, including symlinked parents, to prevent path-scope escape.
  let current = root;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
      throw new Error("Symlink path not permitted: " + relative);
    }
  }
  return relative.split(path.sep).join("/");
}

function readPolicy(root) {
  const filename = path.join(root, "iroko.context.json");
  const raw = fs.readFileSync(filename, "utf8");
  const policy = JSON.parse(raw);
  if (policy.schemaVersion !== 1 ||
      !Array.isArray(policy.sources) || policy.sources.length === 0 ||
      !Array.isArray(policy.writeScopes) || policy.writeScopes.length === 0) {
    throw new Error("Expected schemaVersion:1, non-empty sources and writeScopes");
  }
  for (const name of [...policy.sources, ...policy.writeScopes]) {
    relativePath(root, name.endsWith("/") ? name + "_scope_check_" : name);
  }
  return { policy, raw };
}

function gitHead(root) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return null;
  }
}

function snapshot(root) {
  const { policy, raw } = readPolicy(root);
  const sources = {};
  let total = 0;
  const documents = [];
  for (const name of policy.sources) {
    const rel = relativePath(root, name);
    const data = fs.readFileSync(path.join(root, rel), "utf8");
    total += Buffer.byteLength(data, "utf8");
    if (total > 32000) throw new Error("Context exceeds 32 KB limit; narrow the required sources");
    sources[rel] = digest(data);
    documents.push({ path: rel, content: data });
  }
  const fingerprint = digest(JSON.stringify({
    policy: digest(raw), sources, head: gitHead(root)
  }));
  return { fingerprint, documents, policy };
}

function stateFile(root, sessionId = "") {
  if (process.env.IROKO_CONTEXT_STATE) return path.resolve(process.env.IROKO_CONTEXT_STATE);
  if (!sessionId || typeof sessionId !== "string") {
    throw new Error("Session identifier is required for persisted context evidence");
  }
  const key = digest(root + "\\0" + sessionId).slice(0, 32);
  return path.join(os.tmpdir(), "iroko-context-" + key + ".json");
}

function isInScope(relative, scopes) {
  return scopes.some((scope) => {
    const clean = scope.replaceAll("\\", "/");
    return clean.endsWith("/")
      ? relative.startsWith(clean)
      : relative === clean;
  });
}

function authorized(root, candidate, sessionId) {
  if (typeof sessionId !== "string" || !sessionId.trim()) {
    throw new Error("Missing session identifier");
  }
  const state = JSON.parse(fs.readFileSync(stateFile(root, sessionId), "utf8"));
  if (state.root !== root || state.sessionId !== sessionId ||
      !Number.isFinite(state.expiresAt) || Date.now() >= state.expiresAt ||
      typeof state.task !== "string" || !state.task.trim()) {
    throw new Error("Context state is missing, expired or invalid");
  }
  const fresh = snapshot(root);
  if (fresh.fingerprint !== state.fingerprint) {
    throw new Error("Project decisions or Git HEAD changed after context preparation");
  }
  const relative = relativePath(root, candidate);
  if (!isInScope(relative, fresh.policy.writeScopes)) {
    throw new Error("File is outside approved write scopes: " + relative);
  }
  return relative;
}

module.exports = {
  projectRoot, relativePath, readPolicy, snapshot,
  stateFile, authorized, isInScope
};
