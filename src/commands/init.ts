import * as p from "@clack/prompts";
import pc from "picocolors";
import { showBanner } from "../lib/banner.js";
import { components, getComponentsByType } from "../lib/manifest.js";
import { installComponent, saveIrokoConfig, installSettingsTemplate } from "../lib/installer.js";
import { CLAUDE_DIR } from "../lib/paths.js";
import { existsSync, mkdirSync } from "node:fs";
import type { ComponentType } from "../types.js";

const TYPE_LABELS: Record<ComponentType, { label: string; desc: string }> = {
  rule: {
    label: "Rules",
    desc: "Loaded in every conversation — shape how Claude behaves globally",
  },
  skill: {
    label: "Skills",
    desc: "Slash commands (/commit, /plan-and-confirm, ...)",
  },
  agent: {
    label: "Agents",
    desc: "Specialized subagents for parallel research and review",
  },
  hook: {
    label: "Hooks",
    desc: "Automatic triggers on session events",
  },
};

const TYPE_ORDER: ComponentType[] = ["rule", "skill", "agent", "hook"];

export async function initCommand() {
  showBanner();

  p.intro(pc.bold("Interactive Setup"));

  // Check if ~/.claude exists
  if (!existsSync(CLAUDE_DIR)) {
    p.log.warn(
      `${pc.yellow("~/.claude")} directory not found. Is Claude Code installed?`
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

  // Build grouped options
  const groups: Record<string, { value: string; label: string; hint?: string }[]> = {};

  for (const type of TYPE_ORDER) {
    const info = TYPE_LABELS[type];
    const items = getComponentsByType(type);
    const key = `${pc.bold(info.label)} ${pc.dim(`— ${info.desc}`)}`;

    groups[key] = items.map((c) => {
      const tag = c.hint ? pc.yellow(` (${c.hint})`) : "";
      return {
        value: c.name,
        label: `${pc.bold(c.name)} ${pc.dim("—")} ${pc.dim(c.description)}${tag}`,
      };
    });
  }

  p.log.message(
    `${pc.dim("Navigation:")} ${pc.bold("↑↓")} move  ${pc.bold("space")} toggle  ${pc.bold("a")} select all  ${pc.bold("enter")} confirm`
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
    p.outro(pc.dim("Nothing installed. Run iroko init again to start over."));
    return;
  }

  // Confirm
  const summary = TYPE_ORDER.map((type) => {
    const count = selectedNames.filter((n) =>
      components.find((c) => c.name === n && c.type === type)
    ).length;
    return count > 0 ? `${count} ${TYPE_LABELS[type].label.toLowerCase()}` : null;
  })
    .filter(Boolean)
    .join(", ");

  p.log.info(`Installing: ${pc.bold(summary)}`);

  const confirm = await p.confirm({
    message: `Install ${selectedNames.length} components to ~/.claude?`,
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  // Install
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
      p.log.warn(`Could not install ${pc.bold(name)} — source not found`);
    }
  }

  // Install settings template if no settings.json exists
  installSettingsTemplate();

  // Save iroko config
  saveIrokoConfig(selectedNames);

  s.stop(`${pc.green(`${installed} components installed`)}${failed > 0 ? pc.yellow(` (${failed} failed)`) : ""}`);

  // Summary
  console.log();
  console.log(`  ${pc.dim("Installed to")} ${pc.bold("~/.claude/")}`);
  console.log();

  for (const type of TYPE_ORDER) {
    const typeComponents = selectedNames.filter((n) =>
      components.find((c) => c.name === n && c.type === type)
    );
    if (typeComponents.length === 0) continue;

    console.log(`  ${pc.bold(TYPE_LABELS[type].label)}`);
    for (const name of typeComponents) {
      console.log(`    ${pc.green("+")} ${name}`);
    }
    console.log();
  }

  p.outro(
    `${pc.green("Done!")} Run ${pc.bold("iroko list")} to see installed components.`
  );
}
