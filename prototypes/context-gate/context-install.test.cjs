"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync, execFileSync } = require("node:child_process");

const cli = path.resolve(__dirname, "../../dist/cli.js");

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "iroko-install-"));
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.mkdirSync(path.join(root, ".claude"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "core"), { recursive: true });
  fs.writeFileSync(path.join(root, "docs/decision.md"), "# Approved decision\n");
  fs.writeFileSync(path.join(root, "iroko.context.json"), JSON.stringify({
    schemaVersion: 1, sources: ["docs/decision.md"],
    writeScopes: ["src/"], forbiddenPatterns: [{
      id: "no-sdk-core", pathPrefix: "src/core/", literal: "@vendor/sdk"
    }]
  }));
  execFileSync("git", ["init", "-q"], {cwd:root});
  execFileSync("git", ["add", "-A"], {cwd:root});
  execFileSync("git", ["-c", "user.name=IROKO", "-c", "user.email=tests@invalid.example",
    "commit", "-qm", "fixture"], {cwd:root});
  return root;
}

function run(root, ...args) {
  return spawnSync(process.execPath, [cli, "context", ...args], {
    cwd: root, encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: root, HOME: root },
  });
}

test("project installer preserves unrelated settings and is idempotent", () => {
  const root = fixture();
  const settingsFile = path.join(root, ".claude/settings.local.json");
  fs.writeFileSync(settingsFile, JSON.stringify({
    permissions: { deny: ["Bash(sudo *)"] },
    hooks: { PreToolUse: [{ matcher: "Bash", hooks: [{
      type: "command", command: "node existing-hook.js"
    }] }] }
  }));
  const first = run(root, "init");
  assert.equal(first.status, 0, first.stderr);
  let data = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
  assert.deepEqual(data.permissions.deny, ["Bash(sudo *)"]);
  assert.equal(data.hooks.PreToolUse.length, 2);
  assert.equal(data.hooks.UserPromptSubmit.length, 1);
  assert.equal(data.hooks.SessionStart.length, 1);
  assert.equal(data.hooks.PostCompact.length, 1);
  assert.equal(data.hooks.UserPromptSubmit[0].hooks[0].onFailure, "block");
  for (const event of ["SessionStart", "UserPromptSubmit", "PreToolUse", "PostCompact"]) {
    const hook = data.hooks[event].at(-1).hooks[0];
    assert.equal(hook.command, "node");
    assert.ok(hook.args?.[0].includes(".iroko/context-gate/"));
    assert.ok(!hook.args?.[0].includes("node -e"));
  }

  for (const file of ["core.cjs", "session.cjs", "hook.cjs", "verify.cjs", "prepare.cjs", "post-compact.cjs", "ci-check.cjs"]) {
    assert.ok(fs.existsSync(path.join(root, ".iroko/context-gate", file)), file);
  }
  const second = run(root, "init");
  assert.equal(second.status, 0, second.stderr);
  data = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
  assert.equal(data.hooks.PreToolUse.length, 2);
  assert.equal(data.hooks.UserPromptSubmit.length, 1);
  assert.equal(data.hooks.SessionStart.length, 1);
  assert.equal(run(root, "doctor").status, 0);
  assert.equal(run(root, "verify").status, 0);
});

test("missing policy must not install hooks or runtime", () => {
  const root = fixture();
  fs.rmSync(path.join(root, "iroko.context.json"));
  const result = run(root, "init");
  assert.equal(result.status, 1);
  assert.ok(!fs.existsSync(path.join(root, ".claude/settings.local.json")));
  assert.ok(!fs.existsSync(path.join(root, ".iroko/context-gate")));
});

test("invalid existing settings must not be overwritten", () => {
  const root = fixture();
  const file = path.join(root, ".claude/settings.local.json");
  fs.writeFileSync(file, "{ invalid JSON ");
  const result = run(root, "init");
  assert.equal(result.status, 1);
  assert.equal(fs.readFileSync(file, "utf8"), "{ invalid JSON ");
  assert.ok(!fs.existsSync(path.join(root, ".iroko/context-gate")));
});

test("existing modified guard runtime is not silently overwritten", () => {
  const root = fixture();
  const runtime = path.join(root, ".iroko/context-gate");
  fs.mkdirSync(runtime, { recursive: true });
  fs.writeFileSync(path.join(runtime, "hook.cjs"), "// user changes");
  const result = run(root, "init");
  assert.equal(result.status, 1);
  assert.equal(fs.readFileSync(path.join(runtime, "hook.cjs"), "utf8"), "// user changes");
});


test("incorrect or weakened pre-existing hook wiring is never accepted as active", () => {
  const root = fixture();
  const file = path.join(root, ".claude/settings.local.json");
  fs.writeFileSync(file, JSON.stringify({
    hooks: {
      PreToolUse: [{
        matcher: "Write|Edit", hooks: [{
          type: "command", command: "node -e malicious",
          args: ["\${CLAUDE_PROJECT_DIR}/.iroko/context-gate/hook.cjs"]
        }]
      }]
    }
  }));
  assert.equal(run(root, "init").status, 1);
  assert.ok(!fs.existsSync(path.join(root, ".iroko/context-gate")));
});

test("context doctor detects modified runtime files", () => {
  const root = fixture();
  assert.equal(run(root, "init").status, 0);
  assert.equal(run(root, "doctor").status, 0);
  fs.appendFileSync(path.join(root, ".iroko/context-gate/hook.cjs"), "\\n// modified\\n");
  assert.equal(run(root, "doctor").status, 1);
});


test("Claude Code versions without fail-closed hook support cannot activate the guard", {skip:process.platform==="win32"}, () => {
  const root = fixture();
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), "iroko-claude-version-"));
  const fake = path.join(bin, "claude");
  fs.writeFileSync(fake, "#!/bin/sh\necho '2.1.294 (Claude Code)'\n", {mode:0o755});
  const result = spawnSync(process.execPath, [cli, "context", "init"], {
    cwd:root, encoding:"utf8",
    env:{...process.env,CLAUDE_PROJECT_DIR:root,HOME:root,
      PATH:bin+path.delimiter+process.env.PATH}
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /v2\.1\.295/);
  assert.ok(!fs.existsSync(path.join(root, ".iroko/context-gate")));
});


test("the context verify CLI exits unsuccessfully on a broken project decision", () => {
  const root = fixture();
  assert.equal(run(root, "init").status, 0);
  fs.writeFileSync(path.join(root,"src/core/forbidden.ts"),
    'import foo from "@vendor/sdk";');
  const result = run(root, "verify");
  assert.equal(result.status, 1);
  assert.match(result.stderr + result.stdout, /no-sdk-core/);
});


test("a matching command with narrowed tool matcher is NOT an active write guard", () => {
  const root = fixture();
  const file = path.join(root, ".claude/settings.local.json");
  fs.writeFileSync(file, JSON.stringify({
    hooks: { PreToolUse: [{
      matcher: "Write", hooks: [{
        type: "command", command: "node",
        args: ["$" + "{CLAUDE_PROJECT_DIR}/.iroko/context-gate/hook.cjs"],
        onFailure: "block"
      }]
    }] }
  }));
  const result = run(root, "init");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unsafe IROKO hook/);
  assert.ok(!fs.existsSync(path.join(root, ".iroko/context-gate")));
});


test("installer refuses projects where Claude hooks are disabled", () => {
  const root = fixture();
  fs.writeFileSync(path.join(root, ".claude/settings.local.json"),
    JSON.stringify({disableAllHooks: true}));
  const result = run(root, "init");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /disable all hooks/);
  assert.equal(fs.existsSync(path.join(root, ".iroko/context-gate")), false);
});

test("installer cannot follow a symlinked local IROKO directory", () => {
  const root = fixture();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "iroko-outside-install-"));
  fs.symlinkSync(outside, path.join(root, ".iroko"),
    process.platform === "win32" ? "junction" : "dir");
  const result = run(root, "init");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /symlinked IROKO/);
  assert.equal(fs.readdirSync(outside).length, 0);
});

test("installer refuses a symlinked local Claude settings file", () => {
  const root = fixture();
  const settings = path.join(root, ".claude/settings.local.json");
  const outside = path.join(root, "outside-settings.json");
  fs.writeFileSync(outside, JSON.stringify({permissions:{}}));
  fs.symlinkSync(outside, settings, "file");
  const result = run(root, "init");
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(fs.readFileSync(outside,"utf8")).hooks, undefined);
});
