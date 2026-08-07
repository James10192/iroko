# Rule: Git & Data Safety — no destruction without written approval

## When it activates

This rule activates automatically whenever you are about to run, suggest, or script
any command that can permanently destroy work or data:

- `git reset --hard`, `git push --force` (any variant), `git checkout -- .`,
  `git restore .`, `git stash drop`, `git clean -fd`, `git branch -D` on unmerged work
- `migrate:fresh`, `migrate:reset`, `db:wipe`, `DROP DATABASE`, `DROP TABLE`
- `prisma db push --force-reset`, `prisma migrate reset`, `supabase db reset`,
  `convex dev --reset`, `docker compose down -v` (drops volumes)
- Unscoped `rm -rf` (targeting `/`, `~`, or a bare `*`)
- Any custom script or test runner that calls one of the above on a shared database

## The absolute rule

**Never run a destructive command without the user's explicit written approval in the
CURRENT conversation.**

- Approval given yesterday, or for another task, does not count.
- "Do whatever it takes to fix it" does not count.
- "It would be faster to just reset" is never a reason.
- If a hook or permission setting blocks the command, that block is correct: stop and ask.

When you think a destructive command is needed:

1. Say exactly which command you want to run and why.
2. Present the non-destructive alternative first (plain `migrate`, a targeted rollback,
   a new commit that reverts, editing data directly).
3. Wait for an explicit "yes" before doing anything.

## Backup before any APPROVED destructive operation

Even with approval, always create a backup first. Backups are cheap; lost work is not.

```bash
# Before any approved git-destructive command
git stash push --include-untracked -m "backup-$(date +%Y%m%d_%H%M%S)-before-<command>"

# Before any approved database-destructive command
mysqldump --single-transaction <db> > <durable_path>/<db>_$(date +%Y%m%d_%H%M%S).sql
# (or pg_dump / sqlite .backup / provider export, depending on the stack)
```

- Store database backups in a durable location, never in `/tmp` (it can be wiped).
- Verify the backup is non-empty before proceeding.
- Tell the user where the backup is.

## Protect work that is not yours

Before `git reset`, `git checkout -- .`, or `git clean`, check `git status`. If there are
modified or untracked files you did not create in this conversation (another agent or the
user may be working in parallel):

- Never discard them. Stash them with an explicit name:
  `git stash push -u -m "preserved-external-work-$(date +%s)"`
- Tell the user what you found and what you stashed.

On shared branches (`main`, `master`, `develop`): never force-push. If histories diverge,
rebase or open a PR; if that fails, stop and ask.

## Recovery safety net

If something is lost anyway, these commands recover most of it. Use them before
declaring work gone:

```bash
git reflog --all       # every recent position of every branch
git fsck --lost-found  # orphaned commits and files
```

## Never build on a production server

A server that serves live traffic must never run a heavy build (`next build`,
`npm run build`, `cargo build --release`, etc.). Builds saturate CPU/RAM, real users get
timeouts, and recovery often means forced restarts and downtime.

- Build elsewhere: CI, your local machine, or a temporary build instance.
- Ship the built artifact (bundle, binary, image) to the server.
- The production server only runs an atomic restart (`systemctl restart`, `pm2 reload`,
  `docker pull && docker run`).
- Niceness tricks (`nice`, `ionice`, memory caps) are not a fix; they only delay the
  saturation. If a doc combines "use this workaround" with "force-restart if it hangs",
  the architecture is broken: build off the server.

## Anti-patterns to block

1. Running `migrate:fresh` "to test cleanly" — never without approval.
2. Force-pushing a shared branch to "make the histories match".
3. Discarding uncommitted changes you did not write.
4. Backing up to `/tmp` — it can vanish between two steps.
5. Briefing a sub-agent with "handle the migrations" without forbidding
   fresh/reset/wipe explicitly in its instructions.
6. Building on the production server "just this once, it only takes 5 minutes".

## En clair (FR)

Certaines commandes détruisent définitivement du travail : `git reset --hard` jette tes
modifications, `git push --force` réécrit l'historique partagé, `migrate:fresh` et
`db:wipe` vident toute la base de données. Une fois exécutées, il n'y a pas de bouton
« annuler ».

La règle est simple : l'agent ne lance JAMAIS une de ces commandes sans ton accord écrit,
donné dans la conversation en cours. Même si ça semble plus rapide. Même si tu as dit oui
hier pour autre chose.

Et si tu donnes ton accord : d'abord une sauvegarde (copie de la base, stash git), dans un
endroit durable, vérifiée non vide. Ensuite seulement, la commande.

Dernier point : on ne lance jamais un gros build sur le serveur qui sert les vrais
utilisateurs. On construit ailleurs, on envoie le résultat, le serveur ne fait que
redémarrer. Sinon le site rame ou tombe pendant chaque déploiement.
