import pc from "picocolors";

// Iroko CLI theme — "Botanical + Signature" (Direction D + ▰ from E)
//
// Palette anchored on the iroko hardwood: walnut for the tree silhouette,
// ochre as the single accent (mark + version + key highlights), graphite
// for ambient dim, ivory (default text) for body. ANSI 24-bit when the
// terminal advertises it (COLORTERM=truecolor|24bit), fallback to ANSI 16
// elsewhere. No hard-coded hex on cmd.exe legacy.

const supports24bit =
  process.env.COLORTERM === "truecolor" || process.env.COLORTERM === "24bit";

function rgb(
  r: number,
  g: number,
  b: number,
  text: string,
  fallback: (s: string) => string,
): string {
  return supports24bit
    ? `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`
    : fallback(text);
}

// Walnut — the iroko tree silhouette. RGB(139, 111, 71) → yellow fallback.
export const walnut = (s: string) => rgb(139, 111, 71, s, pc.yellow);

// Ochre — the single accent. RGB(212, 160, 23) → yellowBright fallback.
export const ochre = (s: string) => rgb(212, 160, 23, s, pc.yellowBright);

// Graphite — dim, captions, dividers. picocolors dim is universal.
export const graphite = pc.dim;

// Bold ivory — emphasized text on default fg.
export const ivory = pc.bold;

// Pre-styled mark (▰ filled) and empty mark (▱) — the iroko signature char.
// Used everywhere for status, KPIs, section headers. U+25B0 is Unicode 1.1,
// available on every modern terminal. Fallback ASCII for TERM=dumb.
const isDumb = process.env.TERM === "dumb";
export const MARK = isDumb ? "#" : "▰";
export const MARK_EMPTY = isDumb ? "-" : "▱";
export const MARK_UP = isDumb ? "^" : "▴";
export const MARK_FAIL = isDumb ? "x" : "×";

// Côte d'Ivoire with safe fallback when locale/terminal can't render accents.
const isUtf8 =
  /utf-?8/i.test(process.env.LANG ?? "") ||
  /utf-?8/i.test(process.env.LC_ALL ?? "") ||
  process.platform === "darwin" ||
  process.platform === "linux" ||
  // Modern Windows Terminal sets WT_SESSION; cmd.exe legacy does not.
  Boolean(process.env.WT_SESSION);
export const COUNTRY = isUtf8 ? "Côte d'Ivoire" : "Cote d'Ivoire";

// Standard divider widths used across screens.
export const FULL_WIDTH = 60;
export const TAGLINE_WIDTH = 44;
