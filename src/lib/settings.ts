import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLAUDE_DIR } from "./paths.js";

// Everything about ~/.claude/settings.json lives here: installing the iroko
// template when the file does not exist, and detecting whether the
// guard-destructive hook is wired when the user already has settings.

const __dirname = dirname(fileURLToPath(import.meta.url));

export const SETTINGS_PATH = join(CLAUDE_DIR, "settings.json");

export type SettingsInstallStatus =
  | "written" // settings.json did not exist — iroko template written
  | "exists-wired" // user settings exist and already run the guard hook
  | "exists-unwired" // user settings exist but do NOT run the guard hook
  | "no-template"; // template not found in the package (should not happen)

function findTemplate(): string | null {
  const candidates = [
    resolve(__dirname, "..", "templates", "settings.json.tpl"), // npm: dist/../templates
    resolve(__dirname, "..", "..", "templates", "settings.json.tpl"), // dev: src/lib/../../templates
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

function homeForJson(): string {
  const home = process.env.HOME || process.env.USERPROFILE || "~";
  // JSON-escape the path (Windows backslashes would otherwise corrupt the JSON).
  return JSON.stringify(home).slice(1, -1);
}

export function renderSettingsTemplate(): string | null {
  const tplPath = findTemplate();
  if (!tplPath) return null;
  const template = readFileSync(tplPath, "utf-8");
  return template.replace(/\{\{HOME\}\}/g, homeForJson());
}

// True when the user's settings.json mentions the guard-destructive hook.
// A plain content check is deliberate: whatever the JSON shape, if the
// string is there the hook is wired (or intentionally referenced).
export function isGuardHookWired(): boolean {
  try {
    return readFileSync(SETTINGS_PATH, "utf-8").includes("guard-destructive");
  } catch {
    return false;
  }
}

// The exact JSON block the user can paste into settings.json to wire the hook.
export function guardHookSnippet(): string {
  return [
    "{",
    '  "hooks": {',
    '    "PreToolUse": [',
    "      {",
    '        "matcher": "Bash",',
    '        "hooks": [',
    "          {",
    '            "type": "command",',
    `            "command": "bash \\"${homeForJson()}/.claude/hooks/guard-destructive.sh\\"",`,
    '            "timeout": 10',
    "          }",
    "        ]",
    "      }",
    "    ]",
    "  }",
    "}",
  ].join("\n");
}

// True when the user's settings.json is byte-for-byte the iroko template
// (modulo JSON formatting) — i.e. iroko wrote it and the user never touched it.
export function isSettingsIrokoTemplate(): boolean {
  try {
    const rendered = renderSettingsTemplate();
    if (!rendered) return false;
    const current = JSON.parse(readFileSync(SETTINGS_PATH, "utf-8"));
    return JSON.stringify(current) === JSON.stringify(JSON.parse(rendered));
  } catch {
    return false;
  }
}

export function installSettingsTemplate(): SettingsInstallStatus {
  const rendered = renderSettingsTemplate();
  if (!rendered) return "no-template";

  // Never overwrite existing settings — detect whether the guard hook is
  // wired so init can show the exact block to paste.
  if (existsSync(SETTINGS_PATH)) {
    return isGuardHookWired() ? "exists-wired" : "exists-unwired";
  }

  writeFileSync(SETTINGS_PATH, rendered, "utf-8");
  return "written";
}
