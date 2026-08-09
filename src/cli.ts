import { Command } from "commander";
import { VERSION, showBanner, signatureLine } from "./lib/banner.js";
import { ochre, graphite, ivory, MARK } from "./lib/theme.js";
import { checkForUpdates } from "./lib/update-checker.js";
import { initCommand } from "./commands/init.js";
import { listCommand } from "./commands/list.js";
import { updateCommand } from "./commands/update.js";
import { aboutCommand } from "./commands/about.js";
import { doctorCommand } from "./commands/doctor.js";
import { uninstallCommand } from "./commands/uninstall.js";

// Check for updates silently on every run (throttled to 1×/24h).
checkForUpdates();

const program = new Command();

program
  .name("iroko")
  .description("Premium Claude Code configuration installer")
  .version(VERSION, "-v, --version");

program
  .command("init")
  .description("Interactive setup — select and install components")
  .option("--guide", "beginner pack only, prompts in French (pack débutant, invites en français)")
  .option("--full", "install everything, including create-pr and create-issue")
  .option("--yes", "non-interactive: install the selected pack without prompts")
  .action((opts) => initCommand(opts));

program
  .command("list")
  .alias("ls")
  .description("Show installed and available components")
  .action(listCommand);

program
  .command("update")
  .alias("up")
  .description("Update installed components from GitHub")
  .action(updateCommand);

program
  .command("uninstall")
  .description("Remove installed iroko components, state files, and the guard hook wiring")
  .option("--guide", "output in French (sortie en français)")
  .option("--yes", "non-interactive: uninstall without confirmation")
  .option("--keep-settings", "leave ~/.claude/settings.json completely untouched")
  .action((opts) => uninstallCommand(opts));

program
  .command("about")
  .description("Author, links, and project info")
  .action(aboutCommand);

program
  .command("doctor")
  .description("Diagnose the environment: node, git, gh, ctx7, dev-browser, MCP")
  .option("--guide", "output in French (sortie en français)")
  .action((opts) => doctorCommand(opts));

// Default — banner + commands grid + signature line.
program.action(() => {
  showBanner();
  console.log(`   ${graphite("Commands")}`);
  console.log(
    `     ${ochre(MARK)}  ${ivory("init")}      ${graphite("Interactive setup")}`,
  );
  console.log(
    `     ${ochre(MARK)}  ${ivory("list")}      ${graphite("Show installed components")}`,
  );
  console.log(
    `     ${ochre(MARK)}  ${ivory("update")}    ${graphite("Update from GitHub")}`,
  );
  console.log(
    `     ${ochre(MARK)}  ${ivory("doctor")}    ${graphite("Diagnose the environment")}`,
  );
  console.log(
    `     ${ochre(MARK)}  ${ivory("uninstall")} ${graphite("Remove iroko from ~/.claude")}`,
  );
  console.log(
    `     ${ochre(MARK)}  ${ivory("about")}     ${graphite("Author & links")}`,
  );
  console.log(
    `     ${ochre(MARK)}  ${ivory("--help")}    ${graphite("All commands")}`,
  );
  console.log();
  console.log(signatureLine());
  console.log();
});

program.parse();
