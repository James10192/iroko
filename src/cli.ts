import { Command } from "commander";
import { VERSION, showBanner, signatureLine } from "./lib/banner.js";
import { ochre, graphite, ivory, MARK } from "./lib/theme.js";
import { checkForUpdates } from "./lib/update-checker.js";
import { initCommand } from "./commands/init.js";
import { listCommand } from "./commands/list.js";
import { updateCommand } from "./commands/update.js";
import { aboutCommand } from "./commands/about.js";

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
  .action(initCommand);

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
  .command("about")
  .description("Author, links, and project info")
  .action(aboutCommand);

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
