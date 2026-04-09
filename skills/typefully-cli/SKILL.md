---
name: typefully
description: "Manage Typefully via CLI - me, social-sets, drafts, media, tags, queue. Use when user mentions 'typefully', 'create draft', 'schedule post', 'social media drafts', or wants to interact with the Typefully API."
---

# typefully-cli

## Setup

If `typefully-cli` is not found, install and build it:
```bash
bun --version || curl -fsSL https://bun.sh/install | bash
npx api2cli bundle typefully
npx api2cli link typefully
```

`api2cli link` adds `~/.local/bin` to PATH automatically. The CLI is available in the next command.

Always use `--json` flag when calling commands programmatically.

## Authentication

```bash
typefully-cli auth set "your-token"
typefully-cli auth test
```

## Usage LinkedIn (bonnes pratiques)

- Preferer `--platform linkedin` pour eviter d'activer X par defaut.
- Pour texte multi-lignes, utiliser un fichier temporaire :
  - Windows PowerShell: `typefully-cli drafts create <id> --text (Get-Content -Raw "C:\path\post.txt") --platform linkedin`
  - Bash: `typefully-cli drafts create <id> --text $'line1\n\nline2' --platform linkedin`
- Toujours confirmer avant `--publish-at now`.
- Apres creation, partager `private_url` du draft.

## Resources

### me

| Command | Description |
|---------|-------------|
| `typefully-cli me --json` | Get current authenticated user |

### social-sets

| Command | Description |
|---------|-------------|
| `typefully-cli social-sets list --json` | List all social sets (accounts) |
| `typefully-cli social-sets get <id> --json` | Get social set details with platform accounts |
| `typefully-cli social-sets resolve-linkedin <social-set-id> --url "https://linkedin.com/company/foo" --json` | Resolve LinkedIn company URL to mention syntax |

### drafts

| Command | Description |
|---------|-------------|
| `typefully-cli drafts list <social-set-id> --json` | List all drafts |
| `typefully-cli drafts list <social-set-id> --status scheduled --json` | List scheduled drafts |
| `typefully-cli drafts list <social-set-id> --tags marketing --json` | List drafts by tag |
| `typefully-cli drafts get <social-set-id> <draft-id> --json` | Get a draft by ID |
| `typefully-cli drafts create <social-set-id> --text "Hello!" --platform x,linkedin --json` | Create a draft |
| `typefully-cli drafts create <social-set-id> --text "Now!" --publish-at now --json` | Create and publish immediately |
| `typefully-cli drafts create <social-set-id> --text "Queued" --publish-at next-free-slot --json` | Create and schedule to next slot |
| `typefully-cli drafts create <social-set-id> --text "Later" --publish-at "2026-03-10T14:00:00Z" --json` | Create and schedule at specific time |
| `typefully-cli drafts update <social-set-id> <draft-id> --text "Updated" --json` | Update draft text |
| `typefully-cli drafts update <social-set-id> <draft-id> --publish-at now --json` | Publish an existing draft |
| `typefully-cli drafts delete <social-set-id> <draft-id> --json` | Delete a draft |

### media

| Command | Description |
|---------|-------------|
| `typefully-cli media upload <social-set-id> --file-name "photo.jpg" --json` | Get presigned upload URL |
| `typefully-cli media status <social-set-id> <media-id> --json` | Check media processing status |

### tags

| Command | Description |
|---------|-------------|
| `typefully-cli tags list <social-set-id> --json` | List all tags |
| `typefully-cli tags create <social-set-id> --name "Marketing" --json` | Create a new tag |

### queue

| Command | Description |
|---------|-------------|
| `typefully-cli queue view <social-set-id> --start 2026-03-01 --end 2026-03-31 --json` | View queue slots and scheduled drafts |
| `typefully-cli queue schedule <social-set-id> --json` | Get queue schedule rules |
| `typefully-cli queue schedule-set <social-set-id> --rules '[{"h":9,"m":0,"days":["mon","wed","fri"]}]' --json` | Replace queue schedule |

## Global Flags

All commands support: `--json`, `--format <text|json|csv|yaml>`, `--verbose`, `--no-color`, `--no-header`
