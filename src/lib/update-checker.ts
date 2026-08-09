import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { VERSION } from "./banner.js";
import { ochre, graphite, ivory, MARK_UP } from "./theme.js";
import { IROKO_CONFIG, IROKO_UPDATE_CHECK } from "./paths.js";
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

// The throttle timestamp lives in ~/.claude/.iroko-update-check.json —
// NEVER in .iroko.json. Writing it there used to create a partial config
// ({ lastUpdateCheck } only) that bypassed the "no install" guards of
// `update` and `doctor`. The legacy field is read once for migration,
// then simply ignored.
function readLastCheck(): number {
  try {
    if (existsSync(IROKO_UPDATE_CHECK)) {
      const data = JSON.parse(readFileSync(IROKO_UPDATE_CHECK, "utf-8"));
      if (data?.lastUpdateCheck) return new Date(data.lastUpdateCheck).getTime();
    }
    // Migration: honor a legacy timestamp left in .iroko.json by <= 3.1.0.
    if (existsSync(IROKO_CONFIG)) {
      const legacy = JSON.parse(readFileSync(IROKO_CONFIG, "utf-8"));
      if (legacy?.lastUpdateCheck) return new Date(legacy.lastUpdateCheck).getTime();
    }
  } catch {
    // Corrupt state — treat as "never checked".
  }
  return 0;
}

export function checkForUpdates(): void {
  try {
    // Throttle: only check once per 24h.
    if (Date.now() - readLastCheck() < CHECK_INTERVAL_MS) return;

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
      console.log(
        `   ${ochre(MARK_UP)}  ${ivory("update available")}  ${graphite(`${VERSION} → ${latest}`)}`,
      );
      console.log(
        `      ${graphite(`pnpm add -g ${PACKAGE_NAME}@latest`)}`,
      );
      console.log();
    }

    saveLastCheck();
  } catch {
    // Silent
  }
}

function saveLastCheck(): void {
  try {
    mkdirSync(dirname(IROKO_UPDATE_CHECK), { recursive: true });
    writeFileSync(
      IROKO_UPDATE_CHECK,
      JSON.stringify({ lastUpdateCheck: new Date().toISOString() }, null, 2),
      "utf-8",
    );
  } catch {
    // Silent — don't fail if we can't write
  }
}
