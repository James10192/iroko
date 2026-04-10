import * as p from "@clack/prompts";
import pc from "picocolors";
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, cpSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { showBanner } from "../lib/banner.js";
import { loadIrokoConfig, installComponent, saveIrokoConfig } from "../lib/installer.js";
import { components } from "../lib/manifest.js";

const REPO_URL = "https://github.com/James10192/iroko.git";

export async function updateCommand() {
  showBanner();

  p.intro(pc.bold("Update"));

  const config = loadIrokoConfig();
  if (!config) {
    p.log.warn(
      `No iroko installation found. Run ${pc.bold("iroko init")} first.`
    );
    p.outro(pc.dim("Nothing to update."));
    return;
  }

  p.log.info(
    `Current install: ${pc.bold(`v${config.version}`)} with ${pc.bold(String(config.components.length))} components`
  );

  const s = p.spinner();
  s.start("Fetching latest from GitHub");

  let tmpDir: string;
  try {
    tmpDir = mkdtempSync(join(tmpdir(), "iroko-update-"));
    execSync(`git clone --depth 1 ${REPO_URL} "${tmpDir}"`, {
      stdio: "pipe",
    });
  } catch (error) {
    s.stop(pc.red("Failed to fetch updates"));
    p.log.error("Could not clone repository. Check your network connection.");
    return;
  }

  s.stop(pc.green("Latest version fetched"));

  // Re-install previously selected components
  s.start("Updating components");

  let updated = 0;
  for (const name of config.components) {
    const component = components.find((c) => c.name === name);
    if (!component) continue;

    const sourcePath = join(tmpDir, component.path);
    if (!existsSync(sourcePath)) continue;

    installComponent(component);
    updated++;
  }

  saveIrokoConfig(config.components);

  s.stop(`${pc.green(`${updated} components updated`)}`);

  // Check if CLI itself needs upgrade
  try {
    const latest = execSync("npm view @james10192/iroko version", {
      timeout: 3000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    const { VERSION } = await import("../lib/banner.js");
    if (latest && latest !== VERSION) {
      p.log.info(
        `CLI update available: ${pc.dim(VERSION)} → ${pc.green(latest)}\n  Run ${pc.bold("pnpm add -g @james10192/iroko@latest")} to upgrade the CLI itself.`
      );
    }
  } catch {
    // Offline — skip
  }

  p.outro(
    `${pc.green("Up to date!")} Run ${pc.bold("iroko list")} to verify.`
  );
}
