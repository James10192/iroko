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
  assert.equal(data.hooks.PostCompact.length, 1);
  assert.equal(data.hooks.UserPromptSubmit[0].hooks[0].onFailure, "block");
  for (const event of ["UserPromptSubmit", "PreToolUse", "PostCompact"]) {
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
  assert.equal(run(root, "doctor").status, 0);
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
