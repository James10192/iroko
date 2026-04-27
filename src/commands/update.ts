import * as p from "@clack/prompts";
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { showBannerCompact } from "../lib/banner.js";
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

export async function updateCommand() {
  showBannerCompact();

  p.intro(`${ochre(MARK)}  ${ivory("Update")}`);

  const config = loadIrokoConfig();
  if (!config) {
    p.log.warn(
      `No iroko installation found. Run ${ivory("iroko init")} first.`,
    );
    p.outro(graphite("Nothing to update."));
    return;
  }

  p.log.info(
    `Current install: ${ivory(`v${config.version}`)} with ${ivory(String(config.components.length))} components`,
  );

  const s = p.spinner();
  s.start("Fetching latest from GitHub");

  let tmpDir: string;
  try {
    tmpDir = mkdtempSync(join(tmpdir(), "iroko-update-"));
    execSync(`git clone --depth 1 ${REPO_URL} "${tmpDir}"`, {
      stdio: "pipe",
    });
  } catch {
    s.stop(graphite("Failed to fetch updates"));
    p.log.error("Could not clone repository. Check your network connection.");
    return;
  }

  s.stop(ochre("Latest version fetched"));

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
  s.stop(ochre(`${updated} components updated`));

  // CLI self-upgrade hint when a newer iroko package is published.
  const latest = getLatestVersion();
  if (latest) {
    const { VERSION } = await import("../lib/banner.js");
    if (latest !== VERSION) {
      p.log.info(
        `CLI update available: ${graphite(VERSION)} → ${ochre(latest)}\n  Run ${ivory(`pnpm add -g ${PACKAGE_NAME}@latest`)} to upgrade.`,
      );
    }
  }

  p.outro(`${ochre("Up to date.")} Run ${ivory("iroko list")} to verify.`);
  console.log(rightTag(`${ochre(MARK)}  ${graphite("by @LeVraiMD")}`));
  console.log();
}
