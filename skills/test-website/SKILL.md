---
name: test-website
description: >-
  Test a website like a real human tester: click through pages, forms, menus,
  and logins; find bugs and write a clear report. Use when someone asks to
  test the website, check the app, find bugs, or do a full UI test.
disable-model-invocation: true
---

# Test website (full pass)

You are a careful human tester, not a developer. Prove what the screen does in a real browser. Do not assume it works. Do not change product code unless asked.

## Mindset

- Try empty fields, double-clicks, cancel mid-way, refresh while a popup is open, paste long text, use the keyboard.
- Trust what you **see**. “Saved” but the list did not update = bug. Page looks allowed but nothing loads = bug.
- One bug = one clear write-up. Repeat serious bugs twice before filing.
- Use real mouse clicks on menus and popups (not fake clicks that skip the UI).
- Do not invent features. If something is missing, note it — only call it a bug if the screen promises it.

## Before you start

1. Confirm the website link, login accounts, and whether demo data is fresh or messy.
2. Desktop size about **1440×900**; also peek at phone width (~**390**).
3. Separate browser window per user role (admin vs teacher, etc.).
4. Keep browser console open if you can.
5. Note date, link, and who you logged in as.

If something important is missing, ask once, then continue with clear assumptions.

## How serious is the bug?

| Level | Meaning |
|-------|---------|
| **Critical** | Data loss, security hole, or main job cannot be done |
| **Major** | Feature broken, silent failure, wrong access, unusable popup, dangerous confirm |
| **Minor** | Works with a workaround; confusing or ugly |
| **Nit** | Small polish |

If a busy office would call for help → at least **Major**.

## What to do

1. Quick health check (see skill `quick-check` if attached; else ~15 minutes).
2. Who can open what (see `who-can-access` if attached).
3. Walk every main menu area:
   - Add → Edit → Cancel → Save → confirm the list updated
   - Delete only with a clear confirm
   - Refresh the page → data still there
   - Bad/empty/duplicate inputs
   - Popups stay on screen, close after save, no second ghost popup
4. Keep checking: errors near the button, loading states, no stuck overlays.
5. Write the report (`write-bug-report` if attached; else use the format below).
6. **Stop** after the report unless asked to fix or re-check.

## Always watch for

- Popups centered (not off the side of the screen)
- Clear errors next to the action
- Success **and** failure messages (silent “nothing happened” = bug)
- Forbidden pages for restricted users not looking “open but empty”
- No red console errors on normal happy paths

## Each bug needs

Short title, severity, area, who you were logged in as, numbered steps, expected, actual, proof (what you saw / error), one-line impact for real users.

## Report (minimum)

```markdown
# UI Test Report
Date / Tester / Website / Viewport:

## Summary table
| # | Area | Finding | Severity | Status |

## Counts
Critical / Major / Minor / Nit

## What's solid
- …

## Findings
### F-1 …
…

## Suggested fix order
1. …
```

Save as `UI_TEST_REPORT.md` unless told otherwise. Default status: `Open`.

## Related skills

- Fast check only → `quick-check`
- After fixes → `check-again`
- Access by role → `who-can-access`
- Report template → `write-bug-report`
