import * as p from "@clack/prompts";
import { existsSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { showBannerCompact } from "../lib/banner.js";
import { ochre, graphite, ivory, MARK } from "../lib/theme.js";
import { rightTag } from "../lib/ui.js";
import { loadIrokoConfig } from "../lib/installer.js";
import { components } from "../lib/manifest.js";
import { IROKO_CONFIG, IROKO_UPDATE_CHECK, targetDirs } from "../lib/paths.js";
import {
  SETTINGS_PATH,
  isSettingsIrokoTemplate,
} from "../lib/settings.js";
import { PACKAGE_NAME } from "../lib/constants.js";

export interface UninstallOptions {
  guide?: boolean;
  yes?: boolean;
  keepSettings?: boolean;
}

const STRINGS = {
  en: {
    intro: "Uninstall",
    notInstalled: (cmd: string) =>
      `No iroko installation found (${cmd} was never run). Nothing to remove.`,
    confirm: (n: number) =>
      `Remove ${n} iroko components from ~/.claude? (only files iroko installed)`,
    cancelled: "Uninstall cancelled.",
    removed: (n: number) => `${n} components removed`,
    unknownSkipped: (names: string) =>
      `Unknown components skipped (not in the manifest, left untouched): ${names}`,
    settingsKept: "settings.json left untouched (--keep-settings).",
    settingsHookRemoved:
      "settings.json was the intact iroko template — the guard hooks block was removed.",
    settingsNotTouched:
      "settings.json was modified by you — iroko did not touch it. Remove the guard-destructive hooks block manually if you want it gone.",
    settingsAbsent: "No settings.json — nothing to unwire.",
    configRemoved: "Removed .iroko.json and the update-check file.",
    recap: "Removed from ~/.claude/",
    done: "Done. Iroko is fully uninstalled.",
  },
  fr: {
    intro: "Désinstallation",
    notInstalled: (cmd: string) =>
      `Aucune installation iroko trouvée (${cmd} n'a jamais été lancé). Rien à retirer.`,
    confirm: (n: number) =>
      `Retirer ${n} composants iroko de ~/.claude ? (uniquement les fichiers installés par iroko)`,
    cancelled: "Désinstallation annulée.",
    removed: (n: number) => `${n} composants retirés`,
    unknownSkipped: (names: string) =>
      `Composants inconnus ignorés (absents du manifest, laissés en place) : ${names}`,
    settingsKept: "settings.json laissé intact (--keep-settings).",
    settingsHookRemoved:
      "settings.json était le template iroko intact : le bloc hooks de garde a été retiré.",
    settingsNotTouched:
      "settings.json a été modifié par vous : iroko n'y a pas touché. Retirez le bloc hooks guard-destructive manuellement si vous le souhaitez.",
    settingsAbsent: "Pas de settings.json : rien à décâbler.",
    configRemoved: "Fichiers .iroko.json et de vérification de mise à jour supprimés.",
    recap: "Retirés de ~/.claude/",
    done: "Terminé. Iroko est entièrement désinstallé.",
  },
};

function componentDest(name: string): string | null {
  const component = components.find((c) => c.name === name);
  if (!component) return null;
  const baseName = component.path.split("/").pop()!;
  return join(targetDirs[component.type], baseName);
}

// Remove ONLY the hooks block from a template-intact settings.json.
function removeGuardHooksBlock(): void {
  const settings = JSON.parse(readFileSync(SETTINGS_PATH, "utf-8"));
  delete settings.hooks;
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n", "utf-8");
}

export async function uninstallCommand(opts: UninstallOptions = {}) {
  showBannerCompact();
  const t = opts.guide ? STRINGS.fr : STRINGS.en;

  p.intro(`${ochre(MARK)}  ${ivory(t.intro)}`);

  const config = loadIrokoConfig();
  if (!config?.components?.length) {
    p.log.warn(t.notInstalled(ivory(`npx ${PACKAGE_NAME} init`)));
    p.outro(graphite(t.cancelled));
    return;
  }

  if (!opts.yes) {
    const confirm = await p.confirm({
      message: t.confirm(config.components.length),
    });
    if (p.isCancel(confirm) || !confirm) {
      p.cancel(t.cancelled);
      process.exit(0);
    }
  }

  // 1. Remove ONLY the files listed in .iroko.json (mapped via the manifest).
  const removedNames: string[] = [];
  const unknownNames: string[] = [];
  for (const name of config.components) {
    const dest = componentDest(name);
    if (!dest) {
      unknownNames.push(name);
      continue;
    }
    if (existsSync(dest)) {
      rmSync(dest, { recursive: true, force: true });
      removedNames.push(name);
    }
  }

  p.log.success(ochre(t.removed(removedNames.length)));
  if (unknownNames.length > 0) {
    p.log.info(graphite(t.unknownSkipped(unknownNames.join(", "))));
  }

  // 2. Settings: only unwire the guard hooks block when settings.json is the
  //    intact iroko template. A user-modified settings.json is never touched.
  if (opts.keepSettings) {
    p.log.info(graphite(t.settingsKept));
  } else if (!existsSync(SETTINGS_PATH)) {
    p.log.info(graphite(t.settingsAbsent));
  } else if (isSettingsIrokoTemplate()) {
    removeGuardHooksBlock();
    p.log.info(graphite(t.settingsHookRemoved));
  } else {
    p.log.info(graphite(t.settingsNotTouched));
  }

  // 3. Remove iroko's own state files.
  rmSync(IROKO_CONFIG, { force: true });
  rmSync(IROKO_UPDATE_CHECK, { force: true });
  p.log.info(graphite(t.configRemoved));

  // Recap of what was removed.
  if (removedNames.length > 0) {
    console.log();
    console.log(`   ${graphite(t.recap)}`);
    for (const name of removedNames) {
      console.log(`      ${ochre(MARK)} ${name}`);
    }
    console.log();
  }

  p.outro(ochre(t.done));
  console.log(rightTag(`${ochre(MARK)}  ${graphite("by @LeVraiMD")}`));
  console.log();
}
