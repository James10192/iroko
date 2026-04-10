import { execSync } from "node:child_process";
import pc from "picocolors";
import { VERSION } from "./banner.js";

export function checkForUpdates(): void {
  try {
    const latest = execSync("npm view @james10192/iroko version", {
      timeout: 3000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (!latest || latest === VERSION) return;

    // Simple semver compare: split and compare parts
    const current = VERSION.split(".").map(Number);
    const remote = latest.split(".").map(Number);

    const isNewer =
      remote[0] > current[0] ||
      (remote[0] === current[0] && remote[1] > current[1]) ||
      (remote[0] === current[0] && remote[1] === current[1] && remote[2] > current[2]);

    if (isNewer) {
      console.log();
      console.log(
        `  ${pc.yellow("Update available")} ${pc.dim(VERSION)} → ${pc.green(latest)}`
      );
      console.log(
        `  Run ${pc.bold("pnpm add -g @james10192/iroko@latest")} to update`
      );
      console.log();
    }
  } catch {
    // Offline or npm not available — silent
  }
}
