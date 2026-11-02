"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync, execFileSync } = require("node:child_process");

const here = __dirname;

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "iroko-poc-"));
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "integrations"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "core"), { recursive: true });
  fs.writeFileSync(path.join(root, "docs", "ADR.md"),
    "Use provider adapters; never import a CRM SDK into core services.\n");
  fs.writeFileSync(path.join(root, "iroko.context.json"), JSON.stringify({
    schemaVersion: 1,
    sources: ["docs/ADR.md"],
    writeScopes: ["src/integrations/"],
    forbiddenPatterns: [{
      id: "no-crm-sdk-in-core",
      pathPrefix: "src/core/",
      literal: "@crm-vendor/sdk"
    }]
  }));
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["add", "-A"], { cwd: root });
  execFileSync("git", ["-c", "user.name=IROKO", "-c", "user.email=tests@invalid.example",
    "commit", "-qm", "fixture"], { cwd: root });
  const state = path.join(root, "evidence-state.json");
  const env = { ...process.env, CLAUDE_PROJECT_DIR: root, IROKO_CONTEXT_STATE: state };
  return { root, state, env };
}

function run(file, env, args = [], input) {
  return spawnSync(process.execPath, [path.join(here, file), ...args], {
    env, encoding: "utf8", input
  });
}

function hook(env, tool_name, tool_input = {}) {
  return run("hook.cjs", env, [], JSON.stringify({
    session_id: "fixture-session", tool_name, tool_input
  }));
}

test("missing context blocks writes, but allows explicitly read-only probes", () => {
  const f = fixture();
  assert.equal(hook(f.env, "Write", {
    file_path: path.join(f.root, "src/integrations/adapter.ts")
  }).status, 2);
  assert.equal(hook(f.env, "Bash", { command: "git status" }).status, 0);
  assert.equal(hook(f.env, "Bash", {
    command: "node prototypes/context-gate/prepare.cjs ISSUE-12"
  }).status, 0);
});

test("preparation exposes source evidence, then permits only in-scope file writes", () => {
  const f = fixture();
  const prepared = run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit",
    prompt: "Implement requested feature"
  }));
  assert.equal(prepared.status, 0, prepared.stderr);
  assert.match(prepared.stdout, /Use provider adapters/);
  assert.equal(hook(f.env, "Write", {
    file_path: path.join(f.root, "src/integrations/new.ts")
  }).status, 0);
  assert.equal(hook(f.env, "Edit", {
    file_path: path.join(f.root, "src/core/payments.ts")
  }).status, 2);
});

test("changed decision sources invalidate prepared authorization", () => {
  const f = fixture();
  assert.equal(run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit",
    prompt: "Implement requested feature"
  })).status, 0);
  fs.appendFileSync(path.join(f.root, "docs/ADR.md"), "New rule.\n");
  assert.equal(hook(f.env, "Write", {
    file_path: path.join(f.root, "src/integrations/new.ts")
  }).status, 2);
});

test("expired state invalidates authorization", () => {
  const f = fixture();
  assert.equal(run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit",
    prompt: "Implement requested feature"
  })).status, 0);
  const state = JSON.parse(fs.readFileSync(f.state, "utf8"));
  state.expiresAt = Date.now() - 1;
  fs.writeFileSync(f.state, JSON.stringify(state));
  assert.equal(hook(f.env, "Write", {
    file_path: path.join(f.root, "src/integrations/new.ts")
  }).status, 2);
});

test("shell escape attempts and unknown tool classes are denied", () => {
  const f = fixture();
  assert.equal(run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit",
    prompt: "Implement requested feature"
  })).status, 0);
  for (const command of [
    "git diff --output=/tmp/written",
    "git status; touch /tmp/written",
    "cat README.md $(touch /tmp/written)",
    "pnpm install",
    "echo hacked > src/core/item.ts",
    "cat .env",
    "cat ../credentials.json",
    "rg secret .env",
    "cat /etc/passwd"
  ]) {
    assert.equal(hook(f.env, "Bash", { command }).status, 2, command);
  }
  assert.equal(hook(f.env, "mcp__unclassified__write", {}).status, 2);
});

test("symlinks and paths escaping the project are rejected", () => {
  const f = fixture();
  assert.equal(run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit",
    prompt: "Implement requested feature"
  })).status, 0);
  assert.equal(hook(f.env, "Write", {
    file_path: path.join(f.root, "..", "escape.ts")
  }).status, 2);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "iroko-outside-"));
  fs.symlinkSync(outside, path.join(f.root, "src/integrations/link"), "dir");
  assert.equal(hook(f.env, "Write", {
    file_path: path.join(f.root, "src/integrations/link/escape.ts")
  }).status, 2);
});

test("independent verifier detects a forbidden provider SDK in core", () => {
  const f = fixture();
  const filename = path.join(f.root, "src/core/client.ts");
  fs.writeFileSync(filename, "export const value = 1;\n");
  assert.equal(run("verify.cjs", f.env).status, 0);
  fs.writeFileSync(filename, 'import sdk from "@crm-vendor/sdk";\n');
  const checked = run("verify.cjs", f.env);
  assert.equal(checked.status, 1);
  assert.match(checked.stderr, /no-crm-sdk-in-core/);
});

test("missing required source and malformed policy fail closed", () => {
  const f = fixture();
  fs.rmSync(path.join(f.root, "docs/ADR.md"));
  assert.equal(run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit",
    prompt: "Implement requested feature"
  })).status, 2);
  assert.equal(hook(f.env, "Write", {
    file_path: path.join(f.root, "src/integrations/new.ts")
  }).status, 2);
  fs.writeFileSync(path.join(f.root, "iroko.context.json"), JSON.stringify({
    schemaVersion: 1, sources: [], writeScopes: ["src/"]
  }));
  assert.equal(run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit",
    prompt: "Implement requested feature"
  })).status, 2);
});

test("session-aware gate blocks stale authorizations across sessions", () => {
  const f = fixture();
  assert.equal(run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit", prompt: "Work"
  })).status, 0);
  assert.equal(run("hook.cjs", f.env, [], JSON.stringify({
    session_id: "another-session", tool_name: "Write",
    tool_input: {file_path: path.join(f.root, "src/integrations/new.ts")}
  })).status, 2);
  assert.equal(run("hook.cjs", f.env, [], JSON.stringify({
    tool_name: "Write",
    tool_input: {file_path: path.join(f.root, "src/integrations/new.ts")}
  })).status, 2);
});

test("session hook injects the documented project decisions on every prompt", () => {
  const f = fixture();
  const result = run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit", prompt: "Implement"
  }));
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Use provider adapters/);
  assert.match(result.stdout, /APPROVED WRITE SCOPES/);
});


test("a new Git HEAD invalidates a previous session preflight", () => {
  const f = fixture();
  assert.equal(run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit", prompt: "Implement"
  })).status, 0);
  fs.writeFileSync(path.join(f.root, "unrelated.txt"), "a new commit");
  execFileSync("git", ["add", "-A"], {cwd:f.root});
  execFileSync("git", ["-c", "user.name=IROKO", "-c", "user.email=tests@invalid.example",
    "commit", "-qm", "new head"], {cwd:f.root});
  assert.equal(hook(f.env, "Write", {
    file_path: path.join(f.root, "src/integrations/new.ts")
  }).status, 2);
});

test("guard internals are protected even when the policy broadly permits writes", () => {
  const f = fixture();
  const policyFile = path.join(f.root, "iroko.context.json");
  const policy = JSON.parse(fs.readFileSync(policyFile, "utf8"));
  policy.writeScopes = ["src/", ".iroko/", ".claude/", "iroko.context.json"];
  fs.writeFileSync(policyFile, JSON.stringify(policy));
  assert.equal(run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit", prompt: "Work"
  })).status, 0);
  for (const file of [
    ".iroko/context-gate/hook.cjs", ".claude/settings.local.json",
    "iroko.context.json"
  ]) {
    assert.equal(hook(f.env, "Write", {file_path:path.join(f.root,file)}).status, 2, file);
  }
});

test("refuse to inject .env credentials into the model context", () => {
  const f = fixture();
  fs.writeFileSync(path.join(f.root, ".env"), "TEST_SECRET=never-inject");
  const policyFile = path.join(f.root, "iroko.context.json");
  const policy = JSON.parse(fs.readFileSync(policyFile, "utf8"));
  policy.sources.push(".env");
  fs.writeFileSync(policyFile, JSON.stringify(policy));
  const result = run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit", prompt: "Work"
  }));
  assert.equal(result.status, 2);
  assert.doesNotMatch(result.stdout, /never-inject/);
});

test("required scan directory missing fails the independent verifier", () => {
  const f = fixture();
  fs.rmSync(path.join(f.root, "src/core"), {recursive:true});
  const checked = run("verify.cjs", f.env);
  assert.equal(checked.status, 1);
  assert.match(checked.stderr, /Required policy scan directory/);
});


test("after context compaction, stale authorizations cannot permit edits", () => {
  const f = fixture();
  const preflight = () => run("session.cjs", f.env, [], JSON.stringify({
    session_id: "fixture-session", hook_event_name: "UserPromptSubmit", prompt: "Work"
  }));
  const target = {file_path:path.join(f.root,"src/integrations/new.ts")};
  assert.equal(preflight().status, 0);
  assert.equal(hook(f.env, "Write", target).status, 0);
  assert.equal(run("post-compact.cjs", f.env, [], JSON.stringify({
    session_id:"fixture-session", hook_event_name:"PostCompact", trigger:"auto"
  })).status, 0);
  assert.equal(hook(f.env, "Write", target).status, 2);
  assert.equal(preflight().status, 0);
  assert.equal(hook(f.env, "Write", target).status, 0);
});


test("safe scoped reads are allowed but secret and absolute file reads are denied", () => {
  const f = fixture();
  fs.writeFileSync(path.join(f.root, ".env"), "PASSWORD=sensitive");
  assert.equal(hook(f.env, "Bash", {command:"cat docs/ADR.md"}).status, 0);
  assert.equal(hook(f.env, "Bash", {command:"rg provider docs/ADR.md"}).status, 0);
  for (const command of [
    "cat .env", "cat /etc/passwd", "cat ../secrets.txt",
    "rg password .env", "rg token /etc"
  ]) {
    assert.equal(hook(f.env, "Bash", {command}).status, 2, command);
  }
});


test("trusted-base CI checker rejects candidate policy edits and architecture violations", () => {
  const a = fixture();
  const b = fixture();
  const cli = "ci-check.cjs";
  const runCI = () => run(cli, a.env, [a.root, b.root]);
  assert.equal(runCI().status, 0);
  fs.writeFileSync(path.join(b.root, "src/core/bad.ts"),
    'import vendor from "@crm-vendor/sdk";');
  const violation = runCI();
  assert.equal(violation.status, 1);
  assert.match(violation.stderr, /no-crm-sdk-in-core/);
  fs.rmSync(path.join(b.root, "src/core/bad.ts"));
  const policyFile = path.join(b.root, "iroko.context.json");
  const policy = JSON.parse(fs.readFileSync(policyFile, "utf8"));
  policy.forbiddenPatterns = [];
  fs.writeFileSync(policyFile, JSON.stringify(policy));
  const tampered = runCI();
  assert.equal(tampered.status, 1);
  assert.match(tampered.stderr, /Candidate policy differs/);
});

test("trusted-base checker refuses to evaluate itself as a candidate checkout", () => {
  const f = fixture();
  assert.equal(run("ci-check.cjs", f.env, [f.root, f.root]).status, 1);
});
