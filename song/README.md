# Notification Sounds

Audio notifications for Claude Code hooks. Plays a sound when Claude finishes a task or needs human input.

Adapted from [AI Blueprint](https://github.com/Melvynx/aiblueprint)'s Mac-only `afplay` pattern to work cross-platform.

## Setup

Add to your `~/.claude/settings.json` hooks:

### Windows (PowerShell)

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell -c \"Add-Type -AssemblyName presentationCore; $m = New-Object System.Windows.Media.MediaPlayer; $m.Open([System.Uri]'file:///$HOME/.claude/song/finish.mp3'); $m.Play(); Start-Sleep 3; $m.Close()\""
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell -c \"Add-Type -AssemblyName presentationCore; $m = New-Object System.Windows.Media.MediaPlayer; $m.Open([System.Uri]'file:///$HOME/.claude/song/need-human.mp3'); $m.Play(); Start-Sleep 3; $m.Close()\""
          }
        ]
      }
    ]
  }
}
```

### Mac

```json
{
  "command": "afplay ~/.claude/song/finish.mp3"
}
```

### Linux

```json
{
  "command": "paplay ~/.claude/song/finish.mp3 2>/dev/null || aplay ~/.claude/song/finish.mp3"
}
```

## Files

- `finish.mp3` — Plays when Claude completes a task (Stop hook)
- `need-human.mp3` — Plays when Claude needs human input (Notification hook)

Replace with your own MP3s if you want different sounds.
