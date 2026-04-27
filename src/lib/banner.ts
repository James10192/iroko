import {
  MARK,
  walnut,
  ochre,
  graphite,
  ivory,
  COUNTRY,
  FULL_WIDTH,
} from "./theme.js";
import { divider } from "./ui.js";

const VERSION = "2.2.0";

// Iroko silhouette — full canopy + straight trunk + buttress roots.
// 9 lines, max 32 chars wide. Walnut tone throughout, slight density variation
// (▓ for canopy, █ for trunk and root core) to suggest depth without ornament.
const TREE = [
  "                ▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "                ▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "                      ████",
  "                      ████",
  "                      ████",
  "                    ▓▓████▓▓",
  "                  ▓▓▓▓████▓▓▓▓",
];

function paintTree(): string {
  // Canopy + roots get walnut; trunk gets a touch brighter walnut-on-default
  // by reusing walnut + adding picocolors bold for the trunk core.
  return TREE.map((line) => walnut(line)).join("\n");
}

// Full banner — used on the default screen (`iroko` with no command) and `iroko about`.
export function showBanner(): void {
  console.log();
  console.log(paintTree());
  console.log();
  console.log(
    `   ${ivory("iroko")}                                       ${ochre(`v${VERSION}`)}`,
  );
  console.log(`   ${divider(FULL_WIDTH)}`);
  console.log(`   Claude Code Configuration`);
  console.log(`   ${graphite(`25 components  ·  Built in Abidjan, ${COUNTRY}`)}`);
  console.log();
}

// Compact banner — used inside sub-commands (init/list/update) where the
// workflow is the focus. One marquee line, no tree.
export function showBannerCompact(): void {
  console.log();
  console.log(
    `   ${ochre(MARK)}  ${ivory("iroko")} ${graphite(`v${VERSION}`)}`,
  );
  console.log(`   ${divider(FULL_WIDTH)}`);
  console.log();
}

// Single-line signature shown only on the default screen.
// 3 ancrages : nom, GitHub, X. Pas LinkedIn ici (réservé à `iroko about`).
export function signatureLine(): string {
  return graphite(
    `   by Marcel DJEDJE-LI  ·  github.com/James10192  ·  @LeVraiMD`,
  );
}

export { VERSION };
