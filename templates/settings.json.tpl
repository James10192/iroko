{
  "permissions": {
    "allow": [],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)",
      "Bash(curl * | bash)",
      "Bash(wget * | bash)"
    ]
  },
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"{{HOME}}/.claude/hooks/monitor-session.sh\"",
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"{{HOME}}/.claude/hooks/notify-workflow.sh\"",
            "timeout": 10,
            "async": true
          }
        ]
      }
    ]
  }
}
