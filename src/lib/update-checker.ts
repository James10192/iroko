import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import pc from "picocolors";
import { VERSION } from "./banner.js";
import { IROKO_CONFIG } from "./paths.js";
import { PACKAGE_NAME } from "./constants.js";

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getLatestVersion(): string | null {
  try {
    return execSync(`npm view ${PACKAGE_NAME} version`, {
      timeout: 3000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

export function checkForUpdates(): void {
  try {
    // Throttle: only check once per 24h
    if (existsSync(IROKO_CONFIG)) {
      const config = JSON.parse(readFileSync(IROKO_CONFIG, "utf-8"));
      const lastCheck = config.lastUpdateCheck ? new Date(config.lastUpdateCheck).getTime() : 0;
      if (Date.now() - lastCheck < CHECK_INTERVAL_MS) return;
    }

    const latest = getLatestVersion();
    if (!latest || latest === VERSION) {
      saveLastCheck();
      return;
    }

    const current = VERSION.split(".").map(Number);
    const remote = latest.split(".").map(Number);
    const isNewer =
      remote[0] > current[0] ||
      (remote[0] === current[0] && remote[1] > current[1]) ||
      (remote[0] === current[0] && remote[1] === current[1] && remote[2] > current[2]);

    if (isNewer) {
      console.log();
      console.log(`  ${pc.yellow("Update available")} ${pc.dim(VERSION)} → ${pc.green(latest)}`);
      console.log(`  Run ${pc.bold("pnpm add -g @james10192/iroko@latest")} to update`);
      console.log();
    }

    saveLastCheck();
  } catch {
    // Silent
  }
}

function saveLastCheck(): void {
  try {
    let config: Record<string, unknown> = {};
    if (existsSync(IROKO_CONFIG)) {
      config = JSON.parse(readFileSync(IROKO_CONFIG, "utf-8"));
    }
    config.lastUpdateCheck = new Date().toISOString();
    writeFileSync(IROKO_CONFIG, JSON.stringify(config, null, 2), "utf-8");
  } catch {
    // Silent — don't fail if we can't write
  }
}
