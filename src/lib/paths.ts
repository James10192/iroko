import { homedir } from "node:os";
import { join } from "node:path";

export const HOME = homedir();
export const CLAUDE_DIR = join(HOME, ".claude");
export const IROKO_CONFIG = join(CLAUDE_DIR, ".iroko.json");
// Update-check throttle state lives in its own file so the checker never
// writes a partial .iroko.json (which used to bypass the "not installed" guards).
export const IROKO_UPDATE_CHECK = join(CLAUDE_DIR, ".iroko-update-check.json");

export const targetDirs = {
  rule: join(CLAUDE_DIR, "rules"),
  skill: join(CLAUDE_DIR, "skills"),
  agent: join(CLAUDE_DIR, "agents"),
  hook: join(CLAUDE_DIR, "hooks"),
} as const;
