import { homedir } from "node:os";
import { join } from "node:path";

export const HOME = homedir();
export const CLAUDE_DIR = join(HOME, ".claude");
export const IROKO_CONFIG = join(CLAUDE_DIR, ".iroko.json");

export const targetDirs = {
  rule: join(CLAUDE_DIR, "rules"),
  skill: join(CLAUDE_DIR, "skills"),
  agent: join(CLAUDE_DIR, "agents"),
  hook: join(CLAUDE_DIR, "hooks"),
} as const;
