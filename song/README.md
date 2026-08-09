# Notification Sounds

Audio notifications for Claude Code hooks. Plays a sound when Claude finishes a task or needs human input.

Adapted from [AI Blueprint](https://github.com/Melvynx/aiblueprint)'s Mac-only `afplay` pattern to work cross-platform.

> **Not distributed via npm.** These sounds live in the GitHub repo only — the
> `@james10192/iroko` npm package does not ship them (they would triple the
> tarball). To use them, clone the repo (or download the two MP3s from GitHub)
> and copy them to `~/.claude/song/` yourself.

## Setup

Add to your `~/.claude/settings.json` hooks:

### Windows (PowerShell)

Note: PowerShell does **not** expand variables inside single quotes, so the
path is built by concatenation with the automatic `$HOME` variable.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell -c \"Add-Type -AssemblyName presentationCore; $m = New-Object System.Windows.Media.MediaPlayer; $m.Open([System.Uri]('file:///' + $HOME + '/.claude/song/finish.mp3')); $m.Play(); Start-Sleep 3; $m.Close()\""
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell -c \"Add-Type -AssemblyName presentationCore; $m = New-Object System.Windows.Media.MediaPlayer; $m.Open([System.Uri]('file:///' + $HOME + '/.claude/song/need-human.mp3')); $m.Play(); Start-Sleep 3; $m.Close()\""
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
