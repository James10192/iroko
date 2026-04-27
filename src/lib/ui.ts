import {
  MARK,
  MARK_EMPTY,
  MARK_UP,
  MARK_FAIL,
  ochre,
  graphite,
  ivory,
  FULL_WIDTH,
} from "./theme.js";

// Reusable terminal-UI primitives for the iroko CLI.
// Keeps the visual grammar in one place so the commands stay declarative.

export type State = "installed" | "available" | "update" | "failed";

export function mark(state: State): string {
  switch (state) {
    case "installed":
      return ochre(MARK);
    case "available":
      return graphite(MARK_EMPTY);
    case "update":
      return ochre(MARK_UP);
    case "failed":
      return graphite(MARK_FAIL);
  }
}

// Horizontal divider, dim graphite. Default width 60 chars.
export function divider(width = FULL_WIDTH): string {
  return graphite("─".repeat(width));
}

// Section header: `▰  label` in ochre + ivory.
export function sectionHeader(label: string, count?: string): string {
  const head = `${ochre(MARK)}  ${ivory(label)}`;
  return count ? `${head}   ${graphite(count)}` : head;
}

// Progress bar made of ▰ (installed) and ▱ (available).
// Used in `iroko list` per component type.
export function kpiBar(installed: number, total: number, width = 20): string {
  if (total === 0) return graphite(MARK_EMPTY.repeat(width));
  const filled = Math.round((installed / total) * width);
  const empty = width - filled;
  return ochre(MARK.repeat(filled)) + graphite(MARK_EMPTY.repeat(empty));
}

// Right-aligned mini signature — used in outro success messages.
// Pads with spaces so the tag sits flush right at the given width.
export function rightTag(text: string, width = FULL_WIDTH): string {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, "");
  const pad = Math.max(1, width - stripped.length);
  return " ".repeat(pad) + text;
}

// Aligned label/value row — used in `iroko about`.
// 6-space indent so the label sits one notch deeper than the section header.
export function row(label: string, value: string, labelWidth = 12): string {
  const padded = label.padEnd(labelWidth);
  return `      ${graphite(padded)}${value}`;
}
