#!/bin/bash
# Hook global Claude Code — monitoring + notification OpenClaw

INPUT=$(cat)
HOOK_EVENT=$(echo "$INPUT" | jq -r '.hook_event_name')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_FILE="$HOME/.claude/session-events.log"
CWD=$(echo "$INPUT" | jq -r '.cwd // "unknown"')
PROJECT=$(basename "$CWD")

# OpenClaw gateway (notification de retour vers le chat)
OPENCLAW_URL="http://127.0.0.1:18789/hooks/agent"
OPENCLAW_TOKEN="342f171b9e6b74f2eb63c8a1b41d9fdd381df7ff020d3ae8"

notify_openclaw() {
  local MSG="$1"
  # Envoyer en arrière-plan pour ne pas bloquer Claude Code
  curl -s -X POST "$OPENCLAW_URL" \
    -H "x-openclaw-token: $OPENCLAW_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"$MSG\", \"deliver\": true, \"channel\": \"last\"}" \
    > /dev/null 2>&1 &
}

case "$HOOK_EVENT" in
  "Stop")
    LAST_MSG=$(echo "$INPUT" | jq -r '.last_assistant_message // "No message"' | head -c 300 | tr '"' "'" | tr '\n' ' ')
    echo "[$TIMESTAMP] STOP: [$PROJECT] $LAST_MSG" >> "$LOG_FILE"
    notify_openclaw "✅ Claude Code a terminé sur \`$PROJECT\`. Résumé : $LAST_MSG"
    ;;

  "SubagentStop")
    AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // "agent"')
    LAST_MSG=$(echo "$INPUT" | jq -r '.last_assistant_message // "No message"' | head -c 200 | tr '"' "'" | tr '\n' ' ')
    echo "[$TIMESTAMP] SUBAGENT_STOP: [$PROJECT] $AGENT_TYPE — $LAST_MSG" >> "$LOG_FILE"
    ;;

  "PermissionRequest")
    TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
    TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input' | jq -c | head -c 200 | tr '"' "'")
    echo "[$TIMESTAMP] PERMISSION: [$PROJECT] $TOOL_NAME — $TOOL_INPUT" >> "$LOG_FILE"
    notify_openclaw "⏳ Claude Code attend une permission sur \`$PROJECT\` : outil \`$TOOL_NAME\`"
    ;;

  "Notification")
    NOTIF_TYPE=$(echo "$INPUT" | jq -r '.notification_type')
    MESSAGE=$(echo "$INPUT" | jq -r '.message // ""' | head -c 200 | tr '"' "'")
    echo "[$TIMESTAMP] NOTIFICATION: [$PROJECT] $NOTIF_TYPE — $MESSAGE" >> "$LOG_FILE"
    notify_openclaw "💬 Claude Code (notification) sur \`$PROJECT\` : $NOTIF_TYPE — $MESSAGE"
    ;;
esac

exit 0
