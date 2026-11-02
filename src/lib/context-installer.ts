import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const files = ["core.cjs", "session.cjs", "hook.cjs", "prepare.cjs", "verify.cjs", "post-compact.cjs", "ci-check.cjs"];
const __dirname = dirname(fileURLToPath(import.meta.url));

function claudeHookSupport(): "supported" | "unsupported" | "unverified" {
  try {
    const output = execFileSync("claude", ["--version"], {
      encoding: "utf8", timeout: 5000, stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    const match = output.match(/(?:^|\s)v?(\d+)\.(\d+)\.(\d+)(?:\s|$)/);
    if (!match) return "unverified";
    const version = match.slice(1).map(Number);
    if (version[0] > 2 || version[0] === 2 &&
        (version[1] > 1 || version[1] === 1 && version[2] >= 295)) {
      return "supported";
    }
    return "unsupported";
  } catch {
    return "unverified";
  }
}

function sourceDirectory(): string {
  const candidates = [
    resolve(__dirname, "..", "prototypes", "context-gate"),
    resolve(__dirname, "..", "..", "prototypes", "context-gate"),
  ];
  const root = candidates.find((dir) => files.every((file) => existsSync(join(dir, file))));
  if (!root) throw new Error("IROKO context-gate runtime missing from this installation");
  return root;
}

function validatePath(root: string, input: unknown, source: boolean): string {
  if (typeof input !== "string" || !input.trim()) {
    throw new Error("Invalid relative project path: " + String(input));
  }
  const relativePath = input.endsWith("/") && !source ? input.slice(0, -1) : input;
  if (isAbsolute(input) || input.includes("\\") ||
      relativePath.split("/").some((part) => part === ".." || part === "." || !part)) {
    throw new Error("Invalid relative project path: " + String(input));
  }
  if (!relativePath || relative(root, resolve(root, relativePath)).startsWith("..")) {
    throw new Error("Project path escapes root: " + input);
  }
  if (source) {
    const filename = resolve(root, relativePath);
    if (!existsSync(filename) || !lstatSync(filename).isFile() ||
        realpathSync(filename) !== filename) {
      throw new Error("Approved context source must be a real file: " + input);
    }
    if (/(^|\/)(\.env(?:\.[^/]*)?|\.npmrc|id_rsa|id_ed25519|credentials?|secrets?)(\/|\.|$)/i.test(input)) {
      throw new Error("Refusing sensitive source: " + input);
    }
  }
  return relativePath;
}

function verifyPolicy(project: string): void {
  const filename = join(project, "iroko.context.json");
  if (!existsSync(filename)) throw new Error(
    "No project policy. First create an approved iroko.context.json (see docs/context-gate/README.md)"
  );
  const policy = JSON.parse(readFileSync(filename, "utf8"));
  if (policy?.schemaVersion !== 1 || !Array.isArray(policy.sources) ||
      !policy.sources.length || !Array.isArray(policy.writeScopes) ||
      !policy.writeScopes.length) {
    throw new Error("Policy requires schemaVersion:1, nonempty sources and writeScopes");
  }
  for (const value of policy.sources) validatePath(project, value, true);
  for (const value of policy.writeScopes) validatePath(project, value, false);
  try {
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: project, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    if (!/^[a-f0-9]{40,64}$/i.test(head)) throw new Error("Missing commit");
  } catch {
    throw new Error("Context Gate requires a Git repository with at least one commit");
  }
}

// Exec-form hooks avoid shell quoting differences across Windows, macOS and Linux.
// CLAUDE_PROJECT_DIR is expanded by Claude Code in the hook argument.
function hookDefinition(script: string, block = true) {
  return {
    type: "command",
    command: "node",
    args: [`\${CLAUDE_PROJECT_DIR}/.iroko/context-gate/${script}`],
    timeout: 20,
    ...(block ? { onFailure: "block" } : {}),
  };
}

const definitions = {
  SessionStart: {
    hooks: [hookDefinition("session.cjs", false)],
  },
  UserPromptSubmit: {
    hooks: [hookDefinition("session.cjs")],
  },
  PreToolUse: {
    matcher: "Write|Edit|MultiEdit|NotebookEdit|Bash|PowerShell|Workflow|mcp__.*",
    hooks: [hookDefinition("hook.cjs")],
  },
  PostCompact: {
    hooks: [hookDefinition("post-compact.cjs", false)],
  },
};

function readSettings(filename: string): Record<string, any> {
  if (!existsSync(filename)) return {};
  const settings = JSON.parse(readFileSync(filename, "utf8"));
  if (!settings || typeof settings !== "object" || Array.isArray(settings) ||
      (settings.hooks && (typeof settings.hooks !== "object" || Array.isArray(settings.hooks)))) {
    throw new Error("Existing Claude settings are not a valid JSON object");
  }
  for (const event of Object.keys(definitions)) {
    if (settings.hooks?.[event] && !Array.isArray(settings.hooks[event])) {
      throw new Error("Existing hook event is not an array: " + event);
    }
  }
  return settings;
}

function mergeHooks(settings: Record<string, any>): boolean {
  let changed = false;
  settings.hooks ||= {};
  for (const event of Object.keys(definitions) as Array<keyof typeof definitions>) {
    const existing = (settings.hooks[event] || []) as Array<{hooks?: Array<{command?: string}>}>;
    const desired = definitions[event];
    const signature = ".iroko/context-gate/" +
      (event === "PreToolUse" ? "hook.cjs" :
       event === "PostCompact" ? "post-compact.cjs" : "session.cjs");
    const matches = existing.flatMap((entry) => (entry.hooks || []).map(
      (hook) => ({
        match: String(hook.command || "").includes(signature) ||
          (Array.isArray((hook as any).args) &&
           (hook as any).args.some((arg: unknown) =>
             typeof arg === "string" && arg.includes(signature))),
        hook
      })
    )).filter((v) => v.match);
    if (matches.length > 1) throw new Error("Duplicate IROKO hooks: " + event);
    if (matches.length === 1) {
      const actual = matches[0].hook as any;
      if (actual.command !== "node" ||
          actual.args?.[0] !== desired.hooks[0].args[0] ||
          (["UserPromptSubmit", "PreToolUse"].includes(event) && actual.onFailure !== "block")) {
        throw new Error("Conflicting or unsafe IROKO hook requires manual review: " + event);
      }
    } else {
      existing.push(desired);
      changed = true;
    }
    settings.hooks[event] = existing;
  }
  return changed;
}

function installFiles(source: string, target: string): void {
  // Validate every existing target before copying any file.
  for (const file of files) {
    const destination = join(target, file);
    if (existsSync(destination) &&
        !readFileSync(destination).equals(readFileSync(join(source, file)))) {
      throw new Error("Refusing to overwrite modified IROKO file: " + destination);
    }
  }
  mkdirSync(target, { recursive: true });
  for (const file of files) copyFileSync(join(source, file), join(target, file));
}

export function contextInitCommand(): void {
  const project = resolve(process.cwd());
  try {
    const compatibility = claudeHookSupport();
    if (compatibility === "unsupported") {
      throw new Error("Claude Code v2.1.295+ required for fail-closed onFailure hooks");
    }
    if (compatibility === "unverified") {
      console.warn("Claude Code version not verified; ensure v2.1.295+ before using this guard");
    }
    verifyPolicy(project);
    const target = join(project, ".iroko", "context-gate");
    const settingsFile = join(project, ".claude", "settings.local.json");
    const source = sourceDirectory();
    const settings = readSettings(settingsFile);
    const changed = mergeHooks(settings);
    installFiles(source, target);
    if (changed || !existsSync(settingsFile)) {
      mkdirSync(dirname(settingsFile), { recursive: true });
      writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + "\n", "utf8");
    }
    console.log("IROKO Context Gate enabled for this project only.");
    console.log("Runtime: " + target);
    console.log("Hooks: " + settingsFile);
    console.log("This guards covered Claude tools, not every possible external write path.");
  } catch (error) {
    console.error("IROKO context activation refused: " + String(error));
    process.exitCode = 1;
  }
}

export function contextDoctorCommand(): void {
  const project = resolve(process.cwd());
  const settingsFile = join(project, ".claude", "settings.local.json");
  let hooks = false;
  try {
    const settings = readSettings(settingsFile);
    hooks = Object.keys(definitions).every((event) => {
      const expected = definitions[event as keyof typeof definitions].hooks[0];
      return (settings.hooks?.[event] || []).some(
        (entry: {hooks?: Array<{command?: string;args?: string[];onFailure?: string}>}) =>
          (entry.hooks || []).some((hook) =>
            hook.command === expected.command &&
            hook.args?.[0] === expected.args[0] &&
            (!["UserPromptSubmit", "PreToolUse"].includes(event) || hook.onFailure === "block")
          )
      );
    });
  } catch { /* diagnostic only */ }
  let policy = false;
  try { verifyPolicy(project); policy = true; }
  catch { /* diagnostic only */ }
  const source = sourceDirectory();
  const runtime = files.every((file) => {
    const installed = join(project, ".iroko", "context-gate", file);
    return existsSync(installed) &&
      readFileSync(installed).equals(readFileSync(join(source, file)));
  });
  const status = { policy, runtime, hooks };
  const claudeVersionSupport = claudeHookSupport();
  console.log(JSON.stringify({project, ...status, claudeVersionSupport}, null, 2));
  if (!Object.values(status).every(Boolean) ||
      claudeVersionSupport === "unsupported") process.exitCode = 1;
}

export function contextVerifyCommand(): void {
  const project = resolve(process.cwd());
  try {
    verifyPolicy(project);
    const verifier = join(project, ".iroko", "context-gate", "verify.cjs");
    if (!existsSync(verifier)) {
      throw new Error("Context verifier not installed. Run iroko context init first.");
    }
    execFileSync(process.execPath, [verifier], {
      cwd: project, timeout: 30_000,
      env: {...process.env, CLAUDE_PROJECT_DIR: project},
      stdio: "inherit",
    });
  } catch (error) {
    console.error("IROKO context verification failed: " + String(error));
    process.exitCode = 1;
  }
}
