#!/bin/bash
# Hook Claude Code — Notifications workflow mid-session vers OpenClaw/Telegram

INPUT=$(cat)
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // ""')
CWD=$(echo "$INPUT" | jq -r '.cwd // "unknown"')
PROJECT=$(basename "$CWD")

OPENCLAW_URL="http://127.0.0.1:18789/hooks/agent"
OPENCLAW_TOKEN="342f171b9e6b74f2eb63c8a1b41d9fdd381df7ff020d3ae8"

notify() {
  local MSG="$1"
  curl -s -X POST "$OPENCLAW_URL" \
    -H "x-openclaw-token: $OPENCLAW_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"$MSG\", \"deliver\": true, \"channel\": \"last\"}" \
    > /dev/null 2>&1 &
}

# PostToolUse — détecter les étapes clés du workflow
if [ "$HOOK_EVENT" = "PostToolUse" ]; then
  TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
  TOOL_OUTPUT=$(echo "$INPUT" | jq -r '.tool_response // ""' 2>/dev/null | head -c 300)

  # Détecter: gh issue create → Issue créée
  if [ "$TOOL_NAME" = "Bash" ]; then
    COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

    # Issue GitHub créée
    if echo "$COMMAND" | grep -q "gh issue create"; then
      ISSUE_NUM=$(echo "$TOOL_OUTPUT" | grep -oP '#\d+' | head -1)
      notify "📋 [\`$PROJECT\`] Issue GitHub créée ${ISSUE_NUM}. Prochaine étape : worktree."

    # Worktree créé
    elif echo "$COMMAND" | grep -q "git worktree add"; then
      BRANCH=$(echo "$COMMAND" | grep -oP 'issue-\d+-[\w-]+' | head -1)
      notify "🌿 [\`$PROJECT\`] Worktree créé${BRANCH:+ — branche \`$BRANCH\`}. Implémentation en cours..."

    # PR créée
    elif echo "$COMMAND" | grep -q "gh pr create"; then
      PR_URL=$(echo "$TOOL_OUTPUT" | grep -oP 'https://github\.com/[^\s]+' | head -1)
      notify "🚀 [\`$PROJECT\`] PR créée${PR_URL:+ : $PR_URL}. En attente de ta validation Marcel ✅"

    # Worktree supprimé (cleanup)
    elif echo "$COMMAND" | grep -q "git worktree remove"; then
      notify "🧹 [\`$PROJECT\`] Worktree nettoyé. Workflow terminé ✨"

    # git push
    elif echo "$COMMAND" | grep -qE "^git push"; then
      BRANCH=$(echo "$COMMAND" | grep -oP 'issue-\d+-[\w-]+' | head -1)
      notify "⬆️ [\`$PROJECT\`] Push effectué${BRANCH:+ — branche \`$BRANCH\`}. Création PR en cours..."
    fi
  fi
fi

exit 0
