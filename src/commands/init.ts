import * as p from "@clack/prompts";
import { showBannerCompact } from "../lib/banner.js";
import { ochre, graphite, ivory, MARK } from "../lib/theme.js";
import { divider, rightTag } from "../lib/ui.js";
import { components, getComponentsByType } from "../lib/manifest.js";
import {
  installComponent,
  saveIrokoConfig,
  installSettingsTemplate,
} from "../lib/installer.js";
import { CLAUDE_DIR } from "../lib/paths.js";
import { existsSync, mkdirSync } from "node:fs";
import { TYPE_ORDER, TYPE_META } from "../lib/constants.js";

export async function initCommand() {
  showBannerCompact();

  p.intro(`${ochre(MARK)}  ${ivory("Interactive Setup")}`);

  // Bootstrap ~/.claude if missing.
  if (!existsSync(CLAUDE_DIR)) {
    p.log.warn(
      `${graphite("~/.claude")} directory not found. Is Claude Code installed?`,
    );
    const proceed = await p.confirm({
      message: "Create ~/.claude and continue?",
    });
    if (p.isCancel(proceed) || !proceed) {
      p.cancel("Installation cancelled.");
      process.exit(0);
    }
    mkdirSync(CLAUDE_DIR, { recursive: true });
  }

  // Group options by component type. Each group label is the type label;
  // a `▰` prefix on each item carries the iroko signature inside the prompt.
  const groups: Record<
    string,
    { value: string; label: string; hint?: string }[]
  > = {};

  for (const type of TYPE_ORDER) {
    const info = TYPE_META[type];
    const items = getComponentsByType(type);
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
    `${graphite("Navigation:")} ${ivory("↑↓")} move  ${ivory("space")} toggle  ${ivory("a")} select all  ${ivory("enter")} confirm`,
  );

  const selected = await p.groupMultiselect({
    message: "Select components to install",
    options: groups,
    required: false,
  });

  if (p.isCancel(selected)) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  const selectedNames = selected as string[];

  if (selectedNames.length === 0) {
    p.log.warn("No components selected.");
    p.outro(graphite("Nothing installed. Run iroko init again to start over."));
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

  p.log.info(`Installing: ${ivory(summary)}`);

  const confirm = await p.confirm({
    message: `Install ${selectedNames.length} components to ~/.claude?`,
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  // Install — single spinner, count successes/failures.
  const s = p.spinner();
  s.start("Installing components");

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
      p.log.warn(`Could not install ${ivory(name)} — source not found`);
    }
  }

  installSettingsTemplate();
  saveIrokoConfig(selectedNames);

  const successMsg = ochre(`${installed} components installed`);
  const failMsg = failed > 0 ? graphite(`  (${failed} failed)`) : "";
  s.stop(`${successMsg}${failMsg}`);

  // Per-type recap with the `▰` mark for each new component.
  console.log();
  console.log(`   ${graphite(`Installed to ~/.claude/`)}`);
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

  p.outro(`${ochre("Done.")} Run ${ivory("iroko list")} to verify.`);
  console.log(rightTag(`${ochre(MARK)}  ${graphite("by @LeVraiMD")}`));
  console.log();
}
