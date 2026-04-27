import { showBanner } from "../lib/banner.js";
import { ochre, graphite, ivory, MARK, COUNTRY } from "../lib/theme.js";
import { divider, row } from "../lib/ui.js";
import { components } from "../lib/manifest.js";
import { TYPE_ORDER, TYPE_META, PACKAGE_NAME } from "../lib/constants.js";

export function aboutCommand(): void {
  showBanner();

  // Components breakdown — 1 row per type, derived from manifest.
  console.log(`   ${ochre(MARK)}  ${ivory("Components")}`);
  console.log(`   ${divider()}`);
  for (const type of TYPE_ORDER) {
    const count = components.filter((c) => c.type === type).length;
    if (count === 0) continue;
    console.log(row(TYPE_META[type].label, `${count}`));
  }
  console.log();

  // Author block.
  console.log(`   ${ochre(MARK)}  ${ivory("Author")}`);
  console.log(`   ${divider()}`);
  console.log(row("Name", "Marcel DJEDJE-LI"));
  console.log(row("From", `Abidjan, ${COUNTRY}`));
  console.log(row("GitHub", graphite("github.com/James10192")));
  console.log(row("X", graphite("x.com/LeVraiMD")));
  console.log(
    row(
      "LinkedIn",
      graphite("linkedin.com/in/marcel-djedje-li-099490235"),
    ),
  );
  console.log(row("Email", graphite("djedjelipatrick@gmail.com")));
  console.log();

  // Project block.
  console.log(`   ${ochre(MARK)}  ${ivory("Project")}`);
  console.log(`   ${divider()}`);
  console.log(row("npm", graphite(PACKAGE_NAME)));
  console.log(row("Repo", graphite("github.com/James10192/iroko")));
  console.log(
    row("Issues", graphite("github.com/James10192/iroko/issues")),
  );
  console.log(row("License", graphite("MIT")));
  console.log();

  console.log(
    `   ${ochre(MARK)}  ${graphite("Star the repo if iroko helps you ship faster.")}`,
  );
  console.log();
}
