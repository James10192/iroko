import * as p from "@clack/prompts";
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { showBannerCompact, VERSION } from "../lib/banner.js";
import { ochre, graphite, ivory, MARK } from "../lib/theme.js";
import { rightTag } from "../lib/ui.js";
import {
  loadIrokoConfig,
  installComponent,
  saveIrokoConfig,
} from "../lib/installer.js";
import { components } from "../lib/manifest.js";
import { getLatestVersion } from "../lib/update-checker.js";
import { REPO_URL, PACKAGE_NAME } from "../lib/constants.js";

// True when `remote` is strictly newer than `local` (plain semver triplets).
function isNewerVersion(remote: string, local: string): boolean {
  const r = remote.split(".").map(Number);
  const l = local.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((r[i] ?? 0) > (l[i] ?? 0)) return true;
    if ((r[i] ?? 0) < (l[i] ?? 0)) return false;
  }
  return false;
}

export async function updateCommand() {
  showBannerCompact();

  p.intro(`${ochre(MARK)}  ${ivory("Update")}`);

  const config = loadIrokoConfig();
  if (!config?.components?.length) {
    p.log.warn(
      `No iroko installation found. Run ${ivory(`npx ${PACKAGE_NAME} init`)} first.`,
    );
    p.outro(graphite("Nothing to update."));
    return;
  }

  p.log.info(
    `Current install: ${ivory(`v${config.version}`)} with ${ivory(String(config.components.length))} components`,
  );

  // git is required to fetch the latest components.
  try {
    execSync("git --version", { stdio: "pipe" });
  } catch {
    p.log.error(
      "Git is required to update components but was not found in PATH.\n  Install git (https://git-scm.com) and try again.",
    );
    p.outro(graphite("Update aborted."));
    return;
  }

  const s = p.spinner();
  s.start("Fetching latest from GitHub");

  let tmpDir: string | null = null;
  try {
    let cloneDir: string;
    try {
      cloneDir = mkdtempSync(join(tmpdir(), "iroko-update-"));
      tmpDir = cloneDir;
      // Clone the tag matching THIS CLI version so components always match
      // the code that installs them. Fall back to master when the tag does
      // not exist (e.g. a dev build).
      try {
        execSync(
          `git clone --branch v${VERSION} --depth 1 ${REPO_URL} "${cloneDir}"`,
          { stdio: "pipe" },
        );
      } catch {
        execSync(`git clone --depth 1 ${REPO_URL} "${cloneDir}"`, {
          stdio: "pipe",
        });
      }
    } catch {
      s.stop(graphite("Failed to fetch updates"));
      p.log.error("Could not clone repository. Check your network connection.");
      return;
    }

    s.stop(ochre("Latest version fetched"));

    s.start("Updating components");

    let updated = 0;
    const backedUpNames: string[] = [];
    const unknownNames: string[] = [];
    for (const name of config.components) {
      const component = components.find((c) => c.name === name);
      if (!component) {
        // Legacy component no longer in the manifest — keep the installed
        // files untouched, but say so instead of re-saving it silently.
        unknownNames.push(name);
        continue;
      }

      const sourcePath = join(cloneDir, component.path);
      if (!existsSync(sourcePath)) continue;

      // Install from the freshly cloned repo, not from the local package.
      const result = installComponent(component, cloneDir);
      if (result.ok) {
        updated++;
        if (result.backedUp) backedUpNames.push(name);
      }
    }

    saveIrokoConfig(config.components);
    s.stop(ochre(`${updated} components updated`));

    for (const name of backedUpNames) {
      p.log.info(
        graphite(`${ivory(name)}: local version saved as .bak`),
      );
    }
    if (unknownNames.length > 0) {
      p.log.info(
        graphite(
          `Unknown components kept as-is (not in the current manifest): ${unknownNames.join(", ")}`,
        ),
      );
    }
  } finally {
    if (tmpDir) {
      try {
        rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // Best-effort cleanup — a locked temp dir must not fail the update.
      }
    }
  }

  // CLI self-upgrade hint when a newer iroko package is published.
  const latest = getLatestVersion();
  if (latest && isNewerVersion(latest, VERSION)) {
    p.log.info(
      `CLI update available: ${graphite(VERSION)} → ${ochre(latest)}\n  Run ${ivory(`pnpm add -g ${PACKAGE_NAME}@latest`)} to upgrade.`,
    );
  }

  p.outro(`${ochre("Up to date.")} Run ${ivory("iroko list")} to verify.`);
  console.log(rightTag(`${ochre(MARK)}  ${graphite("by @LeVraiMD")}`));
  console.log();
}
