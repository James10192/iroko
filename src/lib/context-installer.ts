import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const files = ["core.cjs", "session.cjs", "hook.cjs", "prepare.cjs", "verify.cjs"];
const __dirname = dirname(fileURLToPath(import.meta.url));

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
}

function hookCommand(script: string): string {
  // Prefer CLAUDE_PROJECT_DIR over a working-directory-dependent script path.
  return `node -e "require(require('node:path').join(process.env.CLAUDE_PROJECT_DIR, '.iroko/context-gate/${script}'))"`;
}

const definitions = {
  UserPromptSubmit: {
    hooks: [{ type: "command", command: hookCommand("session.cjs"), timeout: 20, onFailure: "block" }],
  },
  PreToolUse: {
    matcher: "Write|Edit|MultiEdit|NotebookEdit|Bash|mcp__.*",
    hooks: [{ type: "command", command: hookCommand("hook.cjs"), timeout: 10, onFailure: "block" }],
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
    const command = desired.hooks[0].command;
    const signature = event === "PreToolUse"
      ? ".iroko/context-gate/hook.cjs" : ".iroko/context-gate/session.cjs";
    const commands = existing.flatMap((entry) => (entry.hooks || []).map((hook) => hook.command || ""));
    if (!commands.includes(command)) {
      if (commands.some((candidate) => candidate.includes(signature))) {
        throw new Error("Conflicting IROKO hook requires manual review: " + event);
      }
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
    hooks = Object.keys(definitions).every((event) =>
      (settings.hooks?.[event] || []).some((entry: {hooks?: Array<{command?: string}>}) =>
        (entry.hooks || []).some((hook) =>
          hook.command === definitions[event as keyof typeof definitions].hooks[0].command
        )
      )
    );
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
  console.log(JSON.stringify({project, ...status}, null, 2));
  if (!Object.values(status).every(Boolean)) process.exitCode = 1;
}
