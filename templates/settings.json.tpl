{
  "permissions": {
    "allow": [],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)",
      "Bash(curl * | bash)",
      "Bash(wget * | bash)",
      "Bash(git reset --hard*)",
      "Bash(git push --force*)",
      "Bash(git push -f *)",
      "Bash(git checkout -- .)",
      "Bash(git clean -f*)",
      "Bash(git stash drop*)",
      "Bash(php artisan migrate:fresh*)",
      "Bash(php artisan migrate:reset*)",
      "Bash(php artisan db:wipe*)",
      "Bash(npx prisma db push --force-reset*)",
      "Bash(npx prisma migrate reset*)",
      "Bash(npx supabase db reset*)",
      "Bash(npx convex dev --reset*)",
      "Bash(docker compose down -v*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"{{HOME}}/.claude/hooks/guard-destructive.sh\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
