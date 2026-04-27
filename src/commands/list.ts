import { showBannerCompact } from "../lib/banner.js";
import { ochre, graphite, ivory, MARK } from "../lib/theme.js";
import { divider, kpiBar, mark } from "../lib/ui.js";
import { components } from "../lib/manifest.js";
import { isComponentInstalled, loadIrokoConfig } from "../lib/installer.js";
import { TYPE_ORDER, TYPE_META } from "../lib/constants.js";

export function listCommand() {
  showBannerCompact();

  const config = loadIrokoConfig();
  const installedDate = config?.installedAt?.split("T")[0];
  console.log(
    installedDate
      ? `   ${graphite(`Installed on ${installedDate} (v${config.version})`)}`
      : `   ${graphite("No iroko config found. Run")} ${ivory("iroko init")} ${graphite("first.")}`,
  );
  console.log();

  // Summary KPI bars — visual overview of how complete the install is.
  const totals = TYPE_ORDER.map((type) => {
    const typeComponents = components.filter((c) => c.type === type);
    const installed = typeComponents.filter((c) =>
      isComponentInstalled(c),
    ).length;
    return { type, installed, total: typeComponents.length };
  });

  console.log(`   ${ochre(MARK)}  ${ivory("Summary")}`);
  console.log(`   ${divider()}`);
  for (const { type, installed, total } of totals) {
    if (total === 0) continue;
    const label = TYPE_META[type].label.padEnd(8);
    const counts = `${installed}/${total}`.padStart(7);
    console.log(`   ${graphite(label)}  ${kpiBar(installed, total)}  ${counts}`);
  }
  console.log();

  // Detail per type — `▰`/`▱` mark each component, dim description below.
  let totalInstalled = 0;
  let totalAvailable = 0;

  for (const { type, installed, total } of totals) {
    if (total === 0) continue;
    totalInstalled += installed;
    totalAvailable += total;

    const typeComponents = components.filter((c) => c.type === type);
    console.log(`   ${ochre(MARK)}  ${ivory(TYPE_META[type].label)}`);

    for (const c of typeComponents) {
      const isInstalled = isComponentInstalled(c);
      const icon = mark(isInstalled ? "installed" : "available");
      const name = isInstalled ? ivory(c.name) : graphite(c.name);
      const tag = c.origin === "community" ? graphite(" [community]") : "";
      console.log(`     ${icon}  ${name}${tag}`);
      console.log(`        ${graphite(c.description)}`);
    }
    console.log();
  }

  console.log(
    `   ${ivory(`${totalInstalled}/${totalAvailable}`)} ${graphite("components installed")}`,
  );
  console.log();

  if (totalInstalled < totalAvailable) {
    console.log(
      `   ${graphite("Run")} ${ivory("iroko init")} ${graphite("to install more.")}`,
    );
    console.log();
  }

  // Third-party recommendations — kept but restyled.
  console.log(
    `   ${ochre(MARK)}  ${ivory("Third-party plugins")} ${graphite("(install separately)")}`,
  );
  console.log(`   ${divider()}`);
  console.log(
    `     ${graphite("GSD")}            ${graphite("Get Shit Done — project management framework")}`,
  );
  console.log(
    `     ${graphite("AI Blueprint")}    ${graphite("github.com/Melvynx/aiblueprint — APEX, ralph-loop, ultrathink")}`,
  );
  console.log(
    `     ${graphite("Impeccable")}      ${graphite("github.com/pbakaus/impeccable — design quality skills")}`,
  );
  console.log(
    `     ${graphite("Superpowers")}     ${graphite("github.com/jpcaparas/superpowers-laravel — Laravel patterns")}`,
  );
  console.log();
}
