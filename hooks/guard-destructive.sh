#!/usr/bin/env bash
# guard-destructive.sh — iroko PreToolUse hook
#
# Blocks destructive shell commands (git reset --hard, push --force, migrate:fresh,
# db:wipe, DROP DATABASE, unscoped rm -rf, ...) until the user gives explicit
# written approval in the conversation.
#
# How it works:
#   Claude Code sends the PreToolUse event as JSON on stdin. This script extracts
#   the Bash command (pure grep/sed, no jq dependency), matches it against a list
#   of destructive patterns, and exits with code 2 on match. Exit code 2 tells
#   Claude Code to block the tool call and feed stderr back to the model.
#
# How to wire it (in .claude/settings.json):
#   {
#     "hooks": {
#       "PreToolUse": [
#         {
#           "matcher": "Bash",
#           "hooks": [
#             {
#               "type": "command",
#               "command": "bash \"$HOME/.claude/hooks/guard-destructive.sh\"",
#               "timeout": 10
#             }
#           ]
#         }
#       ]
#     }
#   }
#
# Exit codes:
#   0 — command is safe, tool call proceeds
#   2 — destructive command detected, tool call is BLOCKED

# Read the whole event payload from stdin.
INPUT=$(cat)

# Only guard Bash tool calls. Other tools pass through.
printf '%s' "$INPUT" | grep -q '"tool_name"[[:space:]]*:[[:space:]]*"Bash"' || exit 0

# Extract the command string from tool_input.command (handles escaped quotes).
CMD=$(printf '%s' "$INPUT" \
  | grep -oE '"command"[[:space:]]*:[[:space:]]*"([^"\\]|\\.)*"' \
  | head -n 1 \
  | sed -e 's/^"command"[[:space:]]*:[[:space:]]*"//' -e 's/"$//')

# No command extracted: nothing to guard.
[ -n "$CMD" ] || exit 0

# Destructive patterns (extended regex, matched case-insensitively).
PATTERNS='
git[[:space:]]+reset[[:space:]]+.*--hard
git[[:space:]]+push[[:space:]]+.*--force
git[[:space:]]+push[[:space:]]+(.*[[:space:]])?-f([[:space:]]|$)
git[[:space:]]+checkout[[:space:]]+--[[:space:]]+\.
git[[:space:]]+clean[[:space:]]+-[A-Za-z]*f
git[[:space:]]+stash[[:space:]]+drop
migrate:fresh
migrate[[:space:]]+fresh
db:wipe
db[[:space:]]+wipe
DROP[[:space:]]+DATABASE
--force-reset
supabase[[:space:]]+db[[:space:]]+reset
docker([[:space:]]+|-)compose[[:space:]]+down[[:space:]]+.*-v
convex[[:space:]]+dev[[:space:]]+.*--reset
prisma[[:space:]]+migrate[[:space:]]+reset
rm[[:space:]]+-[A-Za-z]*[rf][A-Za-z]*[[:space:]]+(/|~/?|\*)([[:space:]]|$)
'

MATCHED=""
while IFS= read -r pattern; do
  [ -n "$pattern" ] || continue
  if printf '%s' "$CMD" | grep -qiE -e "$pattern"; then
    MATCHED="$pattern"
    break
  fi
done <<EOF
$PATTERNS
EOF

if [ -n "$MATCHED" ]; then
  printf '%s\n' "⛔ Destructive command blocked by iroko guard: $CMD. Ask the user for explicit written approval first. / Commande destructive bloquée : demande d'abord l'accord écrit de l'utilisateur." >&2
  exit 2
fi

exit 0
