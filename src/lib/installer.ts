import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Component, IrokoConfig } from "../types.js";
import { CLAUDE_DIR, IROKO_CONFIG, targetDirs } from "./paths.js";
import { VERSION } from "./banner.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getConfigsRoot(): string {
  // In npm package: dist/cli.js → look for configs/ at package root
  // In dev: src/lib/installer.ts → look for configs/ at repo root
  const candidates = [
    resolve(__dirname, "..", "configs"),       // npm: dist/../configs
    resolve(__dirname, "..", "..", "configs"),  // dev: src/lib/../../configs
    resolve(__dirname, ".."),                  // fallback: files at package root level
  ];
  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }
  // If no configs/ dir, use the repo root structure (rules/, skills/, etc.)
  return resolve(__dirname, "..", "..");
}

export function installComponent(component: Component): boolean {
  const root = getConfigsRoot();
  const sourcePath = join(root, component.path);

  if (!existsSync(sourcePath)) {
    // Fallback: try from repo root directly
    const repoRoot = resolve(__dirname, "..", "..");
    const fallback = join(repoRoot, component.path);
    if (!existsSync(fallback)) return false;
    return copyToTarget(fallback, component);
  }

  return copyToTarget(sourcePath, component);
}

function copyToTarget(sourcePath: string, component: Component): boolean {
  const targetDir = targetDirs[component.type];
  mkdirSync(targetDir, { recursive: true });

  if (component.type === "skill") {
    // Skills are directories
    const skillName = component.path.split("/").pop()!;
    const dest = join(targetDir, skillName);
    cpSync(sourcePath, dest, { recursive: true });
  } else {
    // Rules, agents, hooks are single files
    const fileName = component.path.split("/").pop()!;
    const dest = join(targetDir, fileName);
    cpSync(sourcePath, dest);
  }

  return true;
}

export function installSettingsTemplate(): void {
  const root = getConfigsRoot();
  const tplPath = join(root, "..", "templates", "settings.json.tpl");

  if (!existsSync(tplPath)) return;

  const template = readFileSync(tplPath, "utf-8");
  const resolved = template.replace(/\{\{HOME\}\}/g, process.env.HOME || process.env.USERPROFILE || "~");

  const settingsPath = join(CLAUDE_DIR, "settings.json");

  // Never overwrite existing settings
  if (existsSync(settingsPath)) return;

  writeFileSync(settingsPath, resolved, "utf-8");
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
    return JSON.parse(readFileSync(IROKO_CONFIG, "utf-8"));
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
