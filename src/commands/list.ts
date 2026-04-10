import pc from "picocolors";
import { showBanner } from "../lib/banner.js";
import { components } from "../lib/manifest.js";
import { isComponentInstalled, loadIrokoConfig } from "../lib/installer.js";
import { TYPE_ORDER, TYPE_META } from "../lib/constants.js";

export function listCommand() {
  showBanner();

  const config = loadIrokoConfig();

  console.log(
    config
      ? `  ${pc.dim("Installed on")} ${pc.bold(config.installedAt.split("T")[0])} ${pc.dim(`(v${config.version})`)}`
      : `  ${pc.dim("No iroko config found. Run")} ${pc.bold("iroko init")} ${pc.dim("first.")}`
  );
  console.log();

  let totalInstalled = 0;
  let totalAvailable = 0;

  for (const type of TYPE_ORDER) {
    const typeComponents = components.filter((c) => c.type === type);
    if (typeComponents.length === 0) continue;

    console.log(`  ${pc.bold(TYPE_META[type].label)}`);

    for (const c of typeComponents) {
      totalAvailable++;
      const installed = isComponentInstalled(c);
      if (installed) totalInstalled++;

      const icon = installed ? pc.green("  ●") : pc.dim("  ○");
      const name = installed ? pc.bold(c.name) : pc.dim(c.name);
      const desc = pc.dim(c.description);
      const tag = c.origin === "community" ? pc.yellow(" [community]") : "";

      console.log(`${icon} ${name}${tag}`);
      console.log(`      ${desc}`);
    }
    console.log();
  }

  console.log(
    `  ${pc.bold(`${totalInstalled}/${totalAvailable}`)} components installed`
  );
  console.log();

  if (totalInstalled < totalAvailable) {
    console.log(
      `  ${pc.dim("Run")} ${pc.bold("iroko init")} ${pc.dim("to install more components.")}`
    );
    console.log();
  }

  // Third-party recommendations
  console.log(`  ${pc.bold("Third-party plugins")} ${pc.dim("(install separately)")}`);
  console.log(`    ${pc.cyan("GSD")}            ${pc.dim("Get Shit Done — project management framework")}`);
  console.log(`    ${pc.cyan("AI Blueprint")}    ${pc.dim("github.com/Melvynx/aiblueprint — APEX, ralph-loop, ultrathink")}`);
  console.log(`    ${pc.cyan("Impeccable")}      ${pc.dim("github.com/pbakaus/impeccable — design quality skills")}`);
  console.log(`    ${pc.cyan("Superpowers")}     ${pc.dim("github.com/jpcaparas/superpowers-laravel — Laravel patterns")}`);
  console.log();
}
