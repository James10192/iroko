import { Command } from "commander";
import { VERSION } from "./lib/banner.js";
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

// Default to init if no command given
program.action(initCommand);

program.parse();
