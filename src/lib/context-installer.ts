import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const runtimeFiles = [
  "core.cjs", "session.cjs", "hook.cjs", "prepare.cjs", "verify.cjs",
];
const HOOK_SIGNATURE = ".iroko/context-gate/session.cjs";
const __dirname = dirname(fileURLToPath(import.meta.url));

function runtimeSource(): string {
  for (const candidate of [
    resolve(__dirname, "..", "prototypes", "context-gate"),
    resolve(__dirname, "..", "..", "prototypes", "context-gate"),
  ]) {
    if (runtimeFiles.every((file) => existsSync(join(candidate, file)))) return candidate;
  }
  throw new Error("Context gate runtime is not present in this IROKO installation");
}

function hookCommand(script: string): string {
  // Node evaluates this expression from the current project root.
  // CLAUDE_PROJECT_DIR avoids guessing the session's working directory.
  return `node -e "require(require('node:path').join(process.env.CLAUDE_PROJECT_DIR, '.iroko/context-gate/${script}'))"`;
}

function additions() {
  return {
    UserPromptSubmit: [{
      hooks: [{
        type: "command", command: hookCommand("session.cjs"),
        timeout: 20, onFailure: "block",
      }],
    }],
    PreToolUse: [{
      matcher: "Write|Edit|MultiEdit|NotebookEdit|Bash|mcp__.*",
      hooks: [{
        type: "command", command: hookCommand("hook.cjs"),
        timeout: 10, onFailure: "block",
      }],
    }],
  };
}

export function contextInitCommand() {
  const project = resolve(process.cwd());
  const policyFile = join(project, "iroko.context.json");

  if (!existsSync(policyFile)) {
    console.error("IROKO Context Gate is not activated.");
    console.error("Create iroko.context.json with project-approved sources, writeScopes and decisions.");
    console.error("See docs/context-gate/README.md and prototypes/context-gate/examples/iroko.context.json.");
    process.exitCode = 1;
    return;
  }

  let policy: Record<string, unknown>;
  try {
    policy = JSON.parse(readFileSync(policyFile, "utf8"));
    if (policy.schemaVersion !== 1 ||
        !Array.isArray(policy.sources) || policy.sources.length === 0 ||
        !Array.isArray(policy.writeScopes) || policy.writeScopes.length === 0) {
      throw new Error("Policy must have schemaVersion 1, sources and writeScopes");
    }
    for (const source of policy.sources) {
      if (typeof source !== "string" || !source ||
          source.startsWith("/") || source.split(/[\\/]/).includes("..") ||
          !existsSync(join(project, source))) {
        throw new Error("Source missing or outside the project: " + source);
      }
    }
  } catch (error) {
    console.error("Invalid project-approved context policy: " + String(error));
    process.exitCode = 1;
    return;
  }

  const target = join(project, ".iroko", "context-gate");
  const settingsFile = join(project, ".claude", "settings.local.json");
  const source = runtimeSource();
  // Fail before changing anything if an existing runtime copy differs.
  for (const file of runtimeFiles) {
    const destination = join(target, file);
    if (existsSync(destination) &&
        readFileSync(destination).compare(readFileSync(join(source, file))) !== 0) {
      console.error("Refusing to overwrite modified runtime file: " + destination);
      console.error("Review differences and back up local changes before upgrading.");
      process.exitCode = 1;
      return;
    }
  }

  let settings: Record<string, any> = {};
  if (existsSync(settingsFile)) {
    try {
      settings = JSON.parse(readFileSync(settingsFile, "utf8"));
      if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
        throw new Error("Root must be a JSON object");
      }
      if (settings.hooks && (typeof settings.hooks !== "object" || Array.isArray(settings.hooks))) {
        throw new Error("Existing hooks must be an object");
      }
      for (const eventName of ["UserPromptSubmit", "PreToolUse"]) {
        if (settings.hooks?.[eventName] && !Array.isArray(settings.hooks[eventName])) {
          throw new Error("Existing hook event must be an array: " + eventName);
        }
      }
    } catch (error) {
      console.error("Refusing to edit invalid Claude settings: " + String(error));
      process.exitCode = 1;
      return;
    }
  }

  const toAdd = additions();
  const originalSettings = JSON.stringify(settings);
  settings.hooks ||= {};
  for (const eventName of Object.keys(toAdd) as Array<keyof typeof toAdd>) {
    const existing = (settings.hooks[eventName] || []) as any[];
    const hook = toAdd[eventName][0];
    const signature = ".iroko/context-gate/" + (eventName === "PreToolUse" ? "hook.cjs" : "session.cjs");
    if (!existing.some((entry) => Array.isArray(entry.hooks) &&
      entry.hooks.some((handler: { command?: string }) => handler.command?.includes(signature)))) {
      existing.push(hook);
    }
    settings.hooks[eventName] = existing;
  }

  mkdirSync(target, { recursive: true });
  for (const file of runtimeFiles) {
    copyFileSync(join(source, file), join(target, file));
  }
  mkdirSync(dirname(settingsFile), { recursive: true });
  if (JSON.stringify(settings) !== originalSettings || !existsSync(settingsFile)) {
    // Keep local settings local and preserve all unrelated user settings.
    writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + "\n", "utf8");
  }

  console.log("IROKO Context Gate activated only for this project.");
  console.log("Settings: " + settingsFile);
  console.log("Runtime: " + target);
  console.log("Claude reads approved context at each prompt, then gates covered tool writes.");
  console.log("This is a hook guard, not a security sandbox. Shell commands remain restricted.");
}

export function contextDoctorCommand() {
  const project = resolve(process.cwd());
  const settingsFile = join(project, ".claude", "settings.local.json");
  const status = {
    policy: existsSync(join(project, "iroko.context.json")),
    runtime: runtimeFiles.every((f) => existsSync(join(project, ".iroko", "context-gate", f))),
    hooks: false,
  };
  if (existsSync(settingsFile)) {
    try {
      const parsed = JSON.parse(readFileSync(settingsFile, "utf8"));
      const data = JSON.stringify(parsed.hooks || {});
      status.hooks = data.includes(HOOK_SIGNATURE) && data.includes(".iroko/context-gate/hook.cjs");
    } catch { /* diagnostic only */ }
  }
  console.log(JSON.stringify({ project, ...status }, null, 2));
  if (!Object.values(status).every(Boolean)) process.exitCode = 1;
}
