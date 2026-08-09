---
name: visual-check
description: >
  Launch dev-browser to visually verify a page after implementation: navigate, capture screenshots
  and token-efficient AI snapshots, exercise the submit path, report visual issues.
  Vérification visuelle d'une page après implémentation : navigation, captures et snapshots
  accessibilité économes en tokens, test du submit, rapport des problèmes visuels.
argument-hint: "[url-or-route] [--screenshot] [--snapshot] [--full]"
allowed-tools: Bash(npx dev-browser *), Bash(npx --no-install dev-browser *), Bash(npx --yes dev-browser *), Bash(dev-browser *), Read
---

# Visual Check — dev-browser

Verify UI changes visually using dev-browser (sandboxed Chromium with persistent state).

## Tooling check (before first use)

1. **Verify first**: run `npx --no-install dev-browser --help`. Never conclude the tool is missing without this check.
2. **Install directly if missing**: nothing to install permanently. Run every script through `npx --yes dev-browser` and npx downloads it on the fly. Execute this yourself, do not ask the user to install anything.
3. **Fallback**: if npx cannot fetch it (offline, blocked registry), ask the user for a manual screenshot of the page and verify from that.

FR : vérifier d'abord la présence de l'outil, l'utiliser via npx qui le télécharge à la volée, sinon demander une capture d'écran manuelle à l'utilisateur.

## Options

| Flag | Short | Effect |
|------|-------|--------|
| `--screenshot` | `-s` | Take a screenshot and save to temp |
| `--snapshot` | `-a` | Take an AI accessibility snapshot (token-efficient) |
| `--full` | `-f` | Both screenshot + snapshot + report |
| (none) | | Default: snapshot + screenshot |

## Step 1 — Determine the URL

- If `$ARGUMENTS` contains a full URL, use it.
- If only a route path is given (e.g., `/admin/dashboard`), detect the dev server base URL:
  1. Look for the port in the project config (`package.json` dev script, `vite.config`, `next.config`, `.env` `PORT`).
  2. Probe common local ports (3000, 5173, 4200, 8080) with curl until one responds.
  3. If none responds, ASK the user for the URL. Never assume a hardcoded port.

## Step 2 — Pre-check

Verify the dev server is reachable before launching the browser:

```bash
curl -s -o /dev/null -w "%{http_code}" $BASE_URL 2>/dev/null || echo "UNREACHABLE"
```

If unreachable, inform the user:
> The dev server is not reachable at $BASE_URL. Start it (e.g. `pnpm run dev`) then re-run `/visual-check`.

Do NOT proceed if the server is down.

## Step 3 — Navigate & capture

### AI Snapshot (default, token-efficient)

```bash
npx dev-browser <<'SCRIPT'
const page = await browser.getPage("check");
await page.goto("$URL");
await page.waitForSelector("body", { timeout: 10000 });
const snap = await page.snapshotForAI();
console.log(snap.full);
SCRIPT
```

Read the snapshot output. It contains the structured accessibility tree — headings, buttons, inputs, text content, roles. Use this to verify:
- All expected elements are present
- Text content is correct (no placeholder/hardcoded data)
- Interactive elements are accessible (buttons, links, forms)
- No error states visible

### Screenshot (visual verification)

```bash
npx dev-browser <<'SCRIPT'
const page = await browser.getPage("check");
const buf = await page.screenshot({ fullPage: true });
const path = await saveScreenshot(buf, "visual-check.png");
console.log(path);
SCRIPT
```

Read the screenshot file to verify:
- Layout and spacing look correct
- Colors match the project's design system (read it from the project's styles/tokens, don't assume)
- Dark mode works if applicable
- Mobile responsiveness when relevant

## Step 4 — Exercise the submit/mutation path (CRITICAL when interactive)

**A 200-rendered page can hide a 500 on submit.** When the change touches a form, modal, or any CTA that fires a network mutation (POST/PATCH/DELETE), the visual check is INCOMPLETE until you exercise the submit and verify the response is a real success — not a generic "Server error" toast.

### When to apply this step

| Change touches | Submit step required? |
|---|---|
| New page that only reads data (dashboard, list, detail view) | Optional |
| Form, modal, or any CTA with a mutation | **Mandatory** |
| Cascading dropdown / dependent fields | **Mandatory** — the cascade may render correctly while the submit fails downstream |
| Auth flow, payment flow, file upload | **Mandatory** |

### How to exercise the submit headlessly

If the user is authenticated in dev-browser, you can POST directly via `page.evaluate` using the frontend's session (adapt the auth pattern to the project):

```bash
npx dev-browser <<'SCRIPT'
const page = await browser.getPage("check");
const result = await page.evaluate(async () => {
  const payload = { /* the exact payload the form would POST */ };
  const resp = await fetch("<endpoint>", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const text = await resp.text();
  let body;
  try { body = JSON.parse(text); } catch { body = "[non-JSON]: " + text.substring(0, 300); }
  return { status: resp.status, body };
});
console.log("STATUS:", result.status);
console.log("BODY:", JSON.stringify(result.body, null, 2));
SCRIPT
```

**Acceptance**:
- 2xx with the expected JSON body → PASS
- 4xx with an actionable error message in the right language → PASS (controlled validation, surface in report)
- **5xx, especially a plain-text `500 Internal Server Error`** → BLOCK. The exception bypassed all handlers (typical: serialization TypeError, unhandled DB error). Investigate before declaring the visual check passed.

### When the submit fails

A plain-text 500 (no structured error body) means the frontend shows a generic fallback toast — the real exception is **invisible to the user and to the visual check**. To diagnose:

1. Check the server logs / error tracker for the stack trace.
2. Compare the failing path against analogous code in the codebase — a single module that diverges from the convention used by its siblings is a top suspect.

## Step 5 — Report

### Visual Check Report — `$URL`

**Status: PASS / PARTIAL (UI ok, submit broken) / FAIL**

#### UI rendering (from snapshot + screenshot)
- [ ] Page title correct
- [ ] Navigation present and functional
- [ ] Main content renders
- [ ] No error boundaries triggered
- [ ] No "undefined" or placeholder text visible

#### Submit / mutation path
- [ ] **Form/CTA submit returned 2xx** (or expected 4xx with actionable message)
- [ ] No plain-text `500 Internal Server Error`

#### Visual issues
- [severity] description — location on page

#### Accessibility notes
- Any missing aria labels, roles, or keyboard navigation issues found in the snapshot

## Step 6 — Cleanup (optional)

```bash
npx dev-browser <<'SCRIPT'
await browser.closePage("check");
SCRIPT
```

## Advanced usage

### Check multiple routes

```
/visual-check /admin/dashboard /admin/users
```

Loop through each route, capture snapshot + screenshot, aggregate report.

### Mobile viewport

```bash
npx dev-browser <<'SCRIPT'
const page = await browser.getPage("check-mobile");
await page.setViewportSize({ width: 375, height: 812 });
await page.goto("$URL");
const buf = await page.screenshot({ fullPage: true });
await saveScreenshot(buf, "mobile-check.png");
console.log(await page.snapshotForAI().then(s => s.full));
SCRIPT
```

## Rules

- Always check the server is reachable BEFORE launching the browser
- Prefer `snapshotForAI()` for structure — it costs **3-5x fewer tokens than screenshots** while capturing headings, roles, text, and form state. Use screenshots only when visual layout/styling matters.
- Keep page names descriptive: "check", "check-mobile", "check-dark"
- Close pages when done to avoid resource leaks
- Do NOT modify any code — this skill is read-only verification
- **When the change touches a form/modal/CTA, exercise the submit (Step 4). UI rendering correctly ≠ feature working.** A plain-text 500 is invisible from a screenshot and gets reduced to a generic error toast — undetectable without an explicit submit test.

## En clair (FR)

Après un changement d'interface, ce skill ouvre la page dans un navigateur automatisé, vérifie que tout s'affiche, et surtout teste le bouton d'envoi des formulaires : une page qui s'affiche bien (code 200) peut cacher une erreur serveur (500) au moment de valider. Le snapshot accessibilité coûte 3 à 5 fois moins de tokens qu'une capture d'écran.

## Next step

PASS → `/commit`. FAIL or PARTIAL → fix the issue, re-run `/visual-check`.

$ARGUMENTS
