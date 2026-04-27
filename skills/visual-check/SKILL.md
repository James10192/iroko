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

## Prerequisites

This skill requires dev-browser (sandboxed Chromium). Check availability:
- Run: `npx dev-browser --version`
- If not available, inform the user: "dev-browser is required for visual checks. It will be downloaded automatically via npx on first use."
- If npx is not available, this skill cannot work.

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

## Step 4 — Exercise the submit/mutation path (CRITICAL when interactive)

**A 200-rendered page can hide a 500 on submit.** When the change touches a form, modal, or any CTA that fires a network mutation (POST/PATCH/DELETE), the visual check is INCOMPLETE until you exercise the submit and verify the response is a real success — not a generic "Erreur serveur" toast.

### When to apply this step

| Change touches | Submit step required? |
|---|---|
| New page that only reads data (dashboard, list, detail view) | Optional |
| Form, modal, or any CTA with a mutation | **Mandatory** |
| Cascading dropdown / dependent fields | **Mandatory** — the cascade may render correctly while the submit fails for an unrelated downstream bug |
| Auth flow, payment flow, file upload | **Mandatory** |

### How to exercise the submit headlessly

If the user is authenticated in dev-browser, you can POST directly via `page.evaluate` using the FE's session :

```bash
npx dev-browser <<'SCRIPT'
const page = await browser.getPage("check");
const result = await page.evaluate(async () => {
  // Get the current FE session token (NextAuth pattern, adapt for other auth)
  const sess = await fetch("/api/auth/session", { credentials: "include" }).then(r => r.json());
  const headers = { Authorization: `Bearer ${sess.accessToken}`, "Content-Type": "application/json" };

  const payload = { /* the exact payload the form would POST */ };
  const resp = await fetch("/api-be/<endpoint>", { method: "POST", headers, body: JSON.stringify(payload) });
  const text = await resp.text();
  let body;
  try { body = JSON.parse(text); } catch { body = "[non-JSON]: " + text.substring(0, 300); }
  return { status: resp.status, body };
});
console.log("STATUS:", result.status);
console.log("BODY:", JSON.stringify(result.body, null, 2));
SCRIPT
```

**Acceptance** :
- 2xx with the expected JSON body → PASS
- 4xx with an actionable error message in the right language → PASS (controlled validation, surface in report)
- **5xx, especially `500 "Internal Server Error"` plain text** → BLOCK. The exception bypassed all handlers (typical: TypeError in audit/serialization, unhandled DBAPI error, JSON column rejecting a Python `date`/`Decimal`). Investigate before declaring the visual check passed.

### When the submit fails

If the response is a plain-text 500 (no JSON `detail` field), the FE shows a generic fallback ("Erreur serveur" / "Server error"). The actual exception is **invisible to the user and to the visual check**. To diagnose :

1. Check Sentry (BE + FE) for the stack trace.
2. SSH the server and `journalctl -u <service> --since "5 minutes ago"`.
3. Compare the failing path against analogous services in the codebase — a single service that diverges from the convention (e.g. `model_dump()` vs `model_dump(mode="json")`) is a common culprit.

## Step 5 — Report

Present findings in this format:

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
- [ ] No `500 Internal Server Error` plain text
- [ ] Cascading dropdowns produce a valid downstream payload

#### Visual issues
- [severity] description — location on page

#### Accessibility notes
- Any missing aria labels, roles, or keyboard navigation issues found in the snapshot

## Step 6 — Cleanup (optional)

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
- **When the change touches a form/modal/CTA, exercise the submit (Step 4). UI rendering correctly ≠ feature working.** A `500 Internal Server Error` plain-text response is invisible from a screenshot and gets reduced to a generic "Erreur serveur" toast — undetectable without an explicit submit test.

## Lessons learned

### 2026-04-27 — KLASSCI cascade Subject Select (BE #76 / FE #112)

A new cascade filter was shipped to prod and visually validated end-to-end : Subject Select disabled + helper text, dropdown filtered by class, mobile + desktop both correct. The visual check reported PASS.

**Then the user clicked "Créer l'évaluation" and got "Erreur serveur".**

What we learned :

1. **Visual check alone wasn't enough.** It validated the UI but didn't exercise the submit. The cascade cosmetic (greyed Select, helper text, filtered dropdown, KPI tiles, all 5 of 5 cibles) was 100% correct. The bug was downstream of any visual signal — a 500 in the submit handler that the FE swallowed into a generic toast.

2. **The cascade was working from the start.** The 500 was a **latent pre-existing bug** in `grades_service.create_evaluation` since the initial merge of the grades feature : `data.model_dump()` returned Python `date` objects which the JSON audit column couldn't serialize, raising `TypeError` that `audit_log` re-raised. Likely no one tested eval creation on prod with real data before the cascade testing forced the discovery. **Visual check that stops at "the form renders" misses bugs that have been latent for weeks.**

3. **The fix was a one-line convention drift.** Five other services (`admin_service`, `fee_service`, `attendance_service`, `enrollment_service`, etc.) already used `model_dump(mode="json")` for the audit payload. Only `grades_service` diverged. **When investigating a single-service 500, grep for the analogous pattern in sibling services — drift from convention is a top suspect.**

The takeaway is now baked into Step 4 above : if the page has a form, modal, or CTA that fires a mutation, the visual check is **incomplete** until you POST the payload and verify a 2xx response. A plain-text `500 Internal Server Error` (no JSON `detail`) is a red flag that the exception bypassed FastAPI/Starlette handlers — usually a serialization issue.

$ARGUMENTS
