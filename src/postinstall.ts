import pc from "picocolors";

try {
  console.log();
  console.log(`  ${pc.green("@@@@")}`);
  console.log(`  ${pc.green("@@@@@@")}`);
  console.log(`   ${pc.yellow("||")}`);
  console.log();
  console.log(`  ${pc.bold("iroko")} installed ${pc.green("✓")}`);
  console.log();
  console.log(`  Get started:`);
  console.log(`    ${pc.bold("iroko init")}     Interactive setup`);
  console.log(`    ${pc.bold("iroko list")}     Show components`);
  console.log(`    ${pc.bold("iroko --help")}   All commands`);
  console.log();
} catch {
  // Silent fail — some environments block postinstall output
}
