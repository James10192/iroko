import * as p from "@clack/prompts";
import { showBannerCompact } from "../lib/banner.js";
import { ochre, graphite, ivory, MARK } from "../lib/theme.js";
import { divider, rightTag } from "../lib/ui.js";
import {
  components,
  getComponentsForPack,
} from "../lib/manifest.js";
import {
  installComponent,
  saveIrokoConfig,
  installSettingsTemplate,
} from "../lib/installer.js";
import { CLAUDE_DIR } from "../lib/paths.js";
import { existsSync, mkdirSync } from "node:fs";
import { TYPE_ORDER, TYPE_META } from "../lib/constants.js";
import type { Pack } from "../types.js";

export interface InitOptions {
  guide?: boolean;
  full?: boolean;
  yes?: boolean;
}

// CLI copy — English by default, French under --guide (the beginner pack
// is designed for the francophone training audience).
const STRINGS = {
  en: {
    intro: "Interactive Setup",
    introGuide: "Guided Setup",
    claudeMissing: (dir: string) =>
      `${dir} directory not found. Is Claude Code installed?`,
    createClaude: "Create ~/.claude and continue?",
    cancelled: "Installation cancelled.",
    navigation: (up: string, space: string, a: string, enter: string) =>
      `${graphite("Navigation:")} ${up} move  ${space} toggle  ${a} select all  ${enter} confirm`,
    select: "Select components to install",
    nothingSelected: "No components selected.",
    nothingInstalled: "Nothing installed. Run iroko init again to start over.",
    installing: (summary: string) => `Installing: ${summary}`,
    confirmInstall: (count: number) =>
      `Install ${count} components to ~/.claude?`,
    spinner: "Installing components",
    installFail: (name: string) =>
      `Could not install ${name} — source not found`,
    installedCount: (n: number) => `${n} components installed`,
    failedCount: (n: number) => `  (${n} failed)`,
    installedTo: "Installed to ~/.claude/",
    done: "Done.",
    verify: (cmd: string) => `Run ${cmd} to verify.`,
  },
  fr: {
    intro: "Installation interactive",
    introGuide: "Installation guidée (pack débutant)",
    claudeMissing: (dir: string) =>
      `Dossier ${dir} introuvable. Claude Code est-il installé ?`,
    createClaude: "Créer ~/.claude et continuer ?",
    cancelled: "Installation annulée.",
    navigation: (up: string, space: string, a: string, enter: string) =>
      `${graphite("Navigation :")} ${up} déplacer  ${space} cocher  ${a} tout sélectionner  ${enter} valider`,
    select: "Choisissez les composants à installer",
    nothingSelected: "Aucun composant sélectionné.",
    nothingInstalled:
      "Rien n'a été installé. Relancez iroko init --guide pour recommencer.",
    installing: (summary: string) => `Installation : ${summary}`,
    confirmInstall: (count: number) =>
      `Installer ${count} composants dans ~/.claude ?`,
    spinner: "Installation des composants",
    installFail: (name: string) =>
      `Impossible d'installer ${name} : source introuvable`,
    installedCount: (n: number) => `${n} composants installés`,
    failedCount: (n: number) => `  (${n} en échec)`,
    installedTo: "Installés dans ~/.claude/",
    done: "Terminé.",
    verify: (cmd: string) => `Lancez ${cmd} pour vérifier.`,
  },
};

export async function initCommand(opts: InitOptions = {}) {
  showBannerCompact();

  const pack: Pack = opts.guide ? "guide" : opts.full ? "full" : "default";
  const t = opts.guide ? STRINGS.fr : STRINGS.en;

  p.intro(
    `${ochre(MARK)}  ${ivory(opts.guide ? t.introGuide : t.intro)}`,
  );

  // Bootstrap ~/.claude if missing.
  if (!existsSync(CLAUDE_DIR)) {
    if (opts.yes) {
      mkdirSync(CLAUDE_DIR, { recursive: true });
    } else {
      p.log.warn(t.claudeMissing(graphite("~/.claude")));
      const proceed = await p.confirm({ message: t.createClaude });
      if (p.isCancel(proceed) || !proceed) {
        p.cancel(t.cancelled);
        process.exit(0);
      }
      mkdirSync(CLAUDE_DIR, { recursive: true });
    }
  }

  // Scope of the install: components of the requested pack
  // (packs are nested: guide ⊂ default ⊂ full).
  const packComponents = getComponentsForPack(pack);
  const packNames = packComponents.map((c) => c.name);

  let selectedNames: string[];

  if (opts.yes) {
    // Non-interactive: install the whole pack.
    selectedNames = packNames;
  } else {
    // Group options by component type, restricted to the pack scope.
    const groups: Record<
      string,
      { value: string; label: string; hint?: string }[]
    > = {};

    for (const type of TYPE_ORDER) {
      const info = TYPE_META[type];
      const items = packComponents.filter((c) => c.type === type);
      if (items.length === 0) continue;
      const key = `${ivory(info.label)} ${graphite(`— ${info.desc}`)}`;

      groups[key] = items.map((c) => {
        const tag = c.hint ? graphite(` (${c.hint})`) : "";
        return {
          value: c.name,
          label: `${ivory(c.name)} ${graphite("—")} ${graphite(c.description)}${tag}`,
        };
      });
    }

    p.log.message(
      t.navigation(ivory("↑↓"), ivory("space"), ivory("a"), ivory("enter")),
    );

    const selected = await p.groupMultiselect({
      message: t.select,
      options: groups,
      initialValues: packNames,
      required: false,
    });

    if (p.isCancel(selected)) {
      p.cancel(t.cancelled);
      process.exit(0);
    }

    selectedNames = selected as string[];
  }

  if (selectedNames.length === 0) {
    p.log.warn(t.nothingSelected);
    p.outro(graphite(t.nothingInstalled));
    return;
  }

  // Confirm with a one-line summary by type.
  const summary = TYPE_ORDER.map((type) => {
    const count = selectedNames.filter((n) =>
      components.find((c) => c.name === n && c.type === type),
    ).length;
    return count > 0 ? `${count} ${TYPE_META[type].label.toLowerCase()}` : null;
  })
    .filter(Boolean)
    .join(", ");

  p.log.info(t.installing(ivory(summary)));

  if (!opts.yes) {
    const confirm = await p.confirm({
      message: t.confirmInstall(selectedNames.length),
    });

    if (p.isCancel(confirm) || !confirm) {
      p.cancel(t.cancelled);
      process.exit(0);
    }
  }

  // Install — single spinner, count successes/failures.
  const s = p.spinner();
  s.start(t.spinner);

  let installed = 0;
  let failed = 0;

  for (const name of selectedNames) {
    const component = components.find((c) => c.name === name);
    if (!component) continue;

    const ok = installComponent(component);
    if (ok) {
      installed++;
    } else {
      failed++;
      p.log.warn(t.installFail(ivory(name)));
    }
  }

  installSettingsTemplate();
  saveIrokoConfig(selectedNames);

  const successMsg = ochre(t.installedCount(installed));
  const failMsg = failed > 0 ? graphite(t.failedCount(failed)) : "";
  s.stop(`${successMsg}${failMsg}`);

  // Per-type recap with the `▰` mark for each new component.
  console.log();
  console.log(`   ${graphite(t.installedTo)}`);
  console.log(`   ${divider()}`);

  for (const type of TYPE_ORDER) {
    const typeComponents = selectedNames.filter((n) =>
      components.find((c) => c.name === n && c.type === type),
    );
    if (typeComponents.length === 0) continue;

    console.log(`   ${ochre(MARK)}  ${ivory(TYPE_META[type].label)}`);
    for (const name of typeComponents) {
      console.log(`      ${ochre(MARK)} ${name}`);
    }
    console.log();
  }

  p.outro(`${ochre(t.done)} ${t.verify(ivory("iroko list"))}`);
  console.log(rightTag(`${ochre(MARK)}  ${graphite("by @LeVraiMD")}`));
  console.log();
}
