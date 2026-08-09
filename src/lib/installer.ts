import {
  existsSync,
  mkdirSync,
  cpSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Component, IrokoConfig } from "../types.js";
import { IROKO_CONFIG, targetDirs } from "./paths.js";
import { VERSION } from "./banner.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let _configsRoot: string | null = null;

function getConfigsRoot(): string {
  if (_configsRoot) return _configsRoot;
  // In npm package: dist/cli.js → look for configs/ at package root
  // In dev: src/lib/installer.ts → look for configs/ at repo root
  const candidates = [
    resolve(__dirname, "..", "configs"),       // npm: dist/../configs
    resolve(__dirname, "..", "..", "configs"),  // dev: src/lib/../../configs
    resolve(__dirname, ".."),                  // fallback: files at package root level
  ];
  for (const dir of candidates) {
    if (existsSync(dir)) {
      _configsRoot = dir;
      return dir;
    }
  }
  // If no configs/ dir, use the repo root structure (rules/, skills/, etc.)
  const fallbackRoot = resolve(__dirname, "..", "..");
  _configsRoot = fallbackRoot;
  return fallbackRoot;
}

export interface InstallResult {
  ok: boolean;
  // True when the existing local version differed from the source and was
  // saved as `<file>.bak` before being overwritten.
  backedUp: boolean;
}

export function installComponent(component: Component, sourceRoot?: string): InstallResult {
  const root = sourceRoot ?? getConfigsRoot();
  const sourcePath = join(root, component.path);

  if (!existsSync(sourcePath)) {
    // Fallback: try from repo root directly
    const repoRoot = resolve(__dirname, "..", "..");
    const fallback = join(repoRoot, component.path);
    if (!existsSync(fallback)) return { ok: false, backedUp: false };
    return copyToTarget(fallback, component);
  }

  return copyToTarget(sourcePath, component);
}

function filesDiffer(a: string, b: string): boolean {
  try {
    return !readFileSync(a).equals(readFileSync(b));
  } catch {
    return true;
  }
}

// One-level backup: `<dest>.bak`, overwritten on every new backup.
function backupExisting(dest: string): void {
  const bak = `${dest}.bak`;
  rmSync(bak, { recursive: true, force: true });
  cpSync(dest, bak, { recursive: true });
}

function copyToTarget(sourcePath: string, component: Component): InstallResult {
  const targetDir = targetDirs[component.type];
  mkdirSync(targetDir, { recursive: true });

  const baseName = component.path.split("/").pop()!;
  const dest = join(targetDir, baseName);
  let backedUp = false;

  if (component.type === "skill") {
    // Skills are directories — compare their SKILL.md to detect local edits.
    if (
      existsSync(dest) &&
      filesDiffer(join(sourcePath, "SKILL.md"), join(dest, "SKILL.md"))
    ) {
      backupExisting(dest);
      backedUp = true;
    }
    cpSync(sourcePath, dest, { recursive: true });
  } else {
    // Rules, agents, hooks are single files.
    if (existsSync(dest) && filesDiffer(sourcePath, dest)) {
      backupExisting(dest);
      backedUp = true;
    }
    cpSync(sourcePath, dest);
  }

  return { ok: true, backedUp };
}

export function saveIrokoConfig(componentNames: string[]): void {
  const config: IrokoConfig = {
    version: VERSION,
    installedAt: new Date().toISOString(),
    components: componentNames,
  };
  mkdirSync(dirname(IROKO_CONFIG), { recursive: true });
  writeFileSync(IROKO_CONFIG, JSON.stringify(config, null, 2), "utf-8");
}

export function loadIrokoConfig(): IrokoConfig | null {
  if (!existsSync(IROKO_CONFIG)) return null;
  try {
    const parsed = JSON.parse(readFileSync(IROKO_CONFIG, "utf-8"));
    // A config without a components array is a stale partial artifact
    // (e.g. the pre-3.2 update checker wrote { lastUpdateCheck } alone).
    // Treat it as "not installed" instead of crashing downstream.
    if (!parsed || !Array.isArray(parsed.components)) return null;
    return parsed as IrokoConfig;
  } catch {
    return null;
  }
}

export function isComponentInstalled(component: Component): boolean {
  const targetDir = targetDirs[component.type];
  if (component.type === "skill") {
    const skillName = component.path.split("/").pop()!;
    return existsSync(join(targetDir, skillName, "SKILL.md"));
  }
  const fileName = component.path.split("/").pop()!;
  return existsSync(join(targetDir, fileName));
}
