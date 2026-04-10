import pc from "picocolors";

const VERSION = "2.0.0";

const TREE = `
    ${pc.green("@@@@")}
   ${pc.green("@@@@@@@@")}
  ${pc.green("@@@@@@@@@@")}
 ${pc.green("@@@@@@@@@@@@")}
  ${pc.green("@@@@@@@@@@")}
   ${pc.green("@@@@@@@@")}
    ${pc.yellow("||")}
    ${pc.yellow("||")}
`;

export function showBanner() {
  console.log(TREE);
  console.log(
    `  ${pc.bold("iroko")} ${pc.dim(`v${VERSION}`)}  ${pc.dim("—")} ${pc.dim("Claude Code Configuration")}`
  );
  console.log(
    `  ${pc.dim("by Marcel DJEDJE-LI · Abidjan, Cote d'Ivoire")}`
  );
  console.log();
}

export { VERSION };
