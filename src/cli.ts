import { Command } from "commander";
import pc from "picocolors";
import { VERSION, showBanner } from "./lib/banner.js";
import { initCommand } from "./commands/init.js";
import { listCommand } from "./commands/list.js";
import { updateCommand } from "./commands/update.js";

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

// Default: show banner + available commands
program.action(() => {
  showBanner();
  console.log(`  ${pc.bold("Commands:")}`);
  console.log(`    ${pc.green("iroko init")}     Interactive setup`);
  console.log(`    ${pc.green("iroko list")}     Show components`);
  console.log(`    ${pc.green("iroko update")}   Update from GitHub`);
  console.log(`    ${pc.green("iroko --help")}   All commands`);
  console.log();
});

program.parse();
