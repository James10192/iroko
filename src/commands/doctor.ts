import { execSync } from "node:child_process";
import { showBannerCompact } from "../lib/banner.js";
import { ochre, graphite, ivory, MARK } from "../lib/theme.js";
import { divider, mark, type State } from "../lib/ui.js";
import { components } from "../lib/manifest.js";
import { isComponentInstalled, loadIrokoConfig } from "../lib/installer.js";

// iroko doctor — environment diagnostic. Never throws, always exits 0:
// it is a report, not a gate. Every external probe is wrapped in run().

interface CheckRow {
  state: State;
  label: string;
  status: string;
  detail?: string;
  hint?: string;
}

function run(cmd: string, timeoutMs = 15_000): string | null {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      timeout: timeoutMs,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    }).trim();
  } catch {
    return null;
  }
}

// Status vocabulary, EN default / FR with --guide.
function words(fr: boolean) {
  return {
    ok: fr ? "OK" : "OK",
    toInstall: fr ? "à installer" : "to install",
    optional: fr ? "optionnel" : "optional",
    onTheFly: fr ? "à la volée" : "on the fly",
    advanced: fr ? "(pack avancé)" : "(advanced pack)",
    notAuth: fr ? "installé, non authentifié" : "installed, not authenticated",
    fetchedByNpx: fr
      ? "sera téléchargé à la volée par npx"
      : "will be downloaded on the fly by npx",
  };
}

function checkNode(fr: boolean): CheckRow {
  const w = words(fr);
  const major = Number(process.version.replace(/^v/, "").split(".")[0]);
  if (major >= 20) {
    return { state: "installed", label: "node >= 20", status: w.ok, detail: process.version };
  }
  return {
    state: "failed",
    label: "node >= 20",
    status: w.toInstall,
    detail: process.version,
    hint: fr ? "Installer Node 20+ : https://nodejs.org" : "Install Node 20+: https://nodejs.org",
  };
}

function checkGit(fr: boolean): CheckRow {
  const w = words(fr);
  const out = run("git --version");
  if (out) return { state: "installed", label: "git", status: w.ok, detail: out.split("\n")[0] };
  return {
    state: "failed",
    label: "git",
    status: w.toInstall,
    hint: "winget install Git.Git  /  brew install git  /  sudo apt install git",
  };
}

function checkGh(fr: boolean): CheckRow {
  const w = words(fr);
  const version = run("gh --version");
  if (!version) {
    return {
      state: "available",
      label: "gh",
      status: `${w.optional} ${w.advanced}`,
      hint: "winget install GitHub.cli  /  brew install gh  /  sudo apt install gh",
    };
  }
  const auth = run("gh auth status");
  if (auth === null) {
    return {
      state: "available",
      label: "gh",
      status: `${w.notAuth} ${w.advanced}`,
      hint: "gh auth login",
    };
  }
  return {
    state: "installed",
    label: "gh",
    status: `${w.ok} ${w.advanced}`,
    detail: version.split("\n")[0],
  };
}

function checkNpxTool(name: string, probe: string, fr: boolean): CheckRow {
  const w = words(fr);
  const out = run(probe, 30_000);
  if (out !== null) return { state: "installed", label: name, status: w.ok };
  return {
    state: "available",
    label: name,
    status: w.onTheFly,
    detail: w.fetchedByNpx,
    hint: `npx --yes ${name === "ctx7" ? "ctx7@latest" : name}`,
  };
}

function checkClaudeMcp(fr: boolean): CheckRow[] {
  const w = words(fr);
  const rows: CheckRow[] = [];
  const version = run("claude --version");
  if (!version) {
    rows.push({
      state: "available",
      label: "claude CLI",
      status: w.optional,
      detail: fr
        ? "MCP non vérifiable sans la CLI claude"
        : "MCP cannot be verified without the claude CLI",
    });
    return rows;
  }
  rows.push({ state: "installed", label: "claude CLI", status: w.ok, detail: version.split("\n")[0] });

  const list = run("claude mcp list", 30_000);
  if (list && /context7/i.test(list)) {
    rows.push({ state: "installed", label: "MCP context7", status: w.ok });
  } else {
    rows.push({
      state: "available",
      label: "MCP context7",
      status: w.toInstall,
      hint: "claude mcp add context7 -- npx -y @upstash/context7-mcp",
    });
  }
  return rows;
}

function checkIrokoComponents(fr: boolean): CheckRow {
  const w = words(fr);
  const config = loadIrokoConfig();
  const installed = components.filter((c) => isComponentInstalled(c)).length;
  const total = components.length;
  if (!config && installed === 0) {
    return {
      state: "available",
      label: fr ? "composants iroko" : "iroko components",
      status: w.toInstall,
      hint: "iroko init",
    };
  }
  return {
    state: "installed",
    label: fr ? "composants iroko" : "iroko components",
    status: w.ok,
    detail: `${installed}/${total}${config?.version ? ` (v${config.version})` : ""}`,
  };
}

function printRow(row: CheckRow): void {
  const label = row.label.padEnd(18);
  const name = row.state === "installed" ? ivory(label) : graphite(label);
  const detail = row.detail ? `  ${graphite(row.detail)}` : "";
  console.log(`     ${mark(row.state)}  ${name}${row.status}${detail}`);
  if (row.hint) console.log(`        ${graphite("→")} ${graphite(row.hint)}`);
}

export function doctorCommand(opts: { guide?: boolean }): void {
  const fr = Boolean(opts.guide);
  showBannerCompact();

  console.log(`   ${ochre(MARK)}  ${ivory(fr ? "Diagnostic de l'environnement" : "Environment diagnostic")}`);
  console.log(`   ${divider()}`);

  const rows: CheckRow[] = [
    checkNode(fr),
    checkGit(fr),
    checkGh(fr),
    checkNpxTool("ctx7", "npx --no-install ctx7 --version", fr),
    checkNpxTool("dev-browser", "npx --no-install dev-browser --help", fr),
    ...checkClaudeMcp(fr),
    checkIrokoComponents(fr),
  ];

  for (const row of rows) printRow(row);
  console.log();

  const missing = rows.filter((r) => r.state !== "installed" && r.hint);
  if (missing.length > 0) {
    console.log(
      `   ${graphite(
        fr
          ? "Rien de bloquant : chaque ligne ci-dessus donne la commande exacte."
          : "Nothing blocking: each line above shows the exact command.",
      )}`,
    );
  } else {
    console.log(`   ${graphite(fr ? "Tout est prêt." : "Everything is ready.")}`);
  }
  console.log();
  // Diagnostic, not a gate — always exit 0 (default).
}
