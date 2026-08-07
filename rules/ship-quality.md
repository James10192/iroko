# Rule: Ship Quality — every deliverable is finished, not "viable"

## When it activates

This rule activates whenever you build anything visible to an end user or consumer:
a page, a component, an endpoint, a CLI command, a report.

## The rule

Never deliver something labeled "MVP", "basic version", "scaffolding only", or any
euphemism for incomplete. Within the requested scope (see `stay-in-scope`), whatever
you ship is finished. Small scope is fine; unfinished is not.

### Frontend / UI checklist

Every screen or component handles all four states:

- **Loading** — something visible while data arrives (spinner, skeleton), never a blank page.
- **Empty** — a helpful message when there is no data yet ("No invoices yet. Create your first one."), never a bare white zone.
- **Error** — a human message when something fails ("Could not load. Retry?"), never a raw error or a silent nothing.
- **Success** — the actual content, plus confirmation feedback after every user action (toast, message, visual change). The user must never wonder "did that work?".

Also:
- No "coming soon", "under construction", or lorem ipsum visible to users.
- No TODO comments that paper over holes in the current deliverable. TODOs are only
  acceptable for clearly scoped FUTURE features, never for missing pieces of THIS one.
- Responsive by default; interactive targets large enough for touch.
- Consistent with the project's existing design system.

### Backend / API checklist

- Validate all inputs at the boundary.
- Handle errors deliberately: caught, logged with context, returned as clean messages.
  Never expose stack traces or raw exceptions to the caller.
- Protect routes: authentication and authorization checks where they belong.
- No hardcoded secrets, no debug output left in.

### Wording checklist

- Commit messages and PR descriptions never say "MVP", "minimal", "scaffolding",
  "basic" — describe what the change delivers, not what it lacks.
- If a state or case is intentionally out of scope, say so explicitly to the user
  instead of shipping it half-done silently.

## How to self-check before delivering

Reread your diff as if you were the end user:
1. What happens while the data loads? If nothing: fix.
2. What happens when the list is empty? If a blank zone: fix.
3. What happens when the request fails? If a crash or silence: fix.
4. After I click, how do I know it worked? If no feedback: fix.

## Anti-patterns to block

1. A working table with no empty state and no loading state.
2. A form that submits but shows nothing on success or failure.
3. "TODO: handle errors later" in delivered code.
4. A "coming soon" section shipped to fill a layout.
5. An endpoint that returns a raw 500 with a stack trace when input is malformed.

## En clair (FR)

« Ça marche sur le cas idéal » n'est pas fini. Un vrai livrable répond à quatre
questions : que voit l'utilisateur pendant le chargement ? quand il n'y a encore
aucune donnée ? quand ça échoue ? et comment sait-il que son action a réussi ?

Cette règle impose que chaque écran gère ces quatre états, que chaque action donne
un retour visible (message de confirmation ou d'erreur), et qu'on ne livre jamais
de « bientôt disponible », de texte de remplissage ou de TODO qui cache un trou.

Un périmètre petit, c'est très bien. Un périmètre bâclé, non. On peut livrer peu,
mais ce qu'on livre est terminé.
