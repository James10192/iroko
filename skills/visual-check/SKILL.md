---
name: visual-check
description: >
  Launch dev-browser to visually verify a page after implementation. Navigate to a URL,
  take screenshots, inspect elements with AI snapshots, and report visual issues.
  Use after implementing UI changes to verify they render correctly.
argument-hint: "[url-or-route] [--screenshot] [--snapshot] [--full]"
allowed-tools: Bash(npx dev-browser *), Bash(dev-browser *), Read
---

# Visual Check — dev-browser

Verify UI changes visually using dev-browser (sandboxed Chromium with persistent state).

## Options

| Flag | Short | Effect |
|------|-------|--------|
| `--screenshot` | `-s` | Take a screenshot and save to temp |
| `--snapshot` | `-a` | Take an AI accessibility snapshot (token-efficient) |
| `--full` | `-f` | Both screenshot + snapshot + report |
| (none) | | Default: snapshot + screenshot |

## Step 1 — Parse input

Extract the URL/route from `$ARGUMENTS`. If only a route path is given (e.g., `/admin/dashboard`), prepend `http://localhost:3000`.

## Step 2 — Pre-check

Verify the dev server is reachable before launching the browser:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "UNREACHABLE"
```

If unreachable, inform the user:
> Le serveur dev n'est pas accessible sur localhost:3000.
> Lance-le avec `pnpm run dev` puis relance `/visual-check`.

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
- Colors match the design system (primary=#0F3F8C, accent=#F58220)
- Dark mode works if applicable
- Mobile responsiveness (if `--mobile` flag added later)

## Step 4 — Report

Present findings in this format:

### Visual Check Report — `$URL`

**Status: PASS / ISSUES FOUND**

#### Elements verified (from snapshot)
- [ ] Page title correct
- [ ] Navigation present and functional
- [ ] Main content renders
- [ ] No error boundaries triggered
- [ ] No "undefined" or placeholder text visible

#### Visual issues (from screenshot)
- [severity] description — location on page

#### Accessibility notes
- Any missing aria labels, roles, or keyboard navigation issues found in the snapshot

## Step 5 — Cleanup (optional)

If done with verification:

```bash
npx dev-browser <<'SCRIPT'
await browser.closePage("check");
SCRIPT
```

## Advanced usage

### Check multiple routes

```
/visual-check /admin/dashboard /admin/enrollments /admin/fees
```

Loop through each route, capture snapshot + screenshot, aggregate report.

### Connect to existing Chrome

If the user has Chrome open with the app:

```bash
npx dev-browser --connect <<'SCRIPT'
const tabs = await browser.listPages();
console.log(JSON.stringify(tabs, null, 2));
SCRIPT
```

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

- Always check server is reachable BEFORE launching browser
- Prefer `snapshotForAI()` for structure (3-5x fewer tokens than screenshots)
- Use screenshots only when visual layout/styling matters
- Keep page names descriptive: "check", "check-mobile", "check-dark"
- Close pages when done to avoid resource leaks
- Do NOT modify any code — this skill is read-only verification

$ARGUMENTS
