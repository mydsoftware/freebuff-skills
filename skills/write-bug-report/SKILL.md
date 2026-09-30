---
name: write-bug-report
description: >-
  Write a clear website bug report others can follow: summary table, steps,
  severity, and what to fix first. Use when writing UI_TEST_REPORT.md,
  REGRESSION_REPORT.md, or formatting QA findings.
disable-model-invocation: true
---

# Write bug report

Write reports a normal person and a developer can both follow. No fluff. Someone else should be able to repeat the bug from your steps alone.

## File names

| Kind of run | Default file |
|-------------|--------------|
| Full test | `UI_TEST_REPORT.md` |
| After fixes | `REGRESSION_REPORT.md` |
| Quick check | `SMOKE_REPORT.md` |
| Access by role | `PERMISSIONS_TEST_REPORT.md` |

Use another name if the user asks.

## Status words

`Open` · `Fixed` · `Retest-Pass` · `Retest-Fail` · `Deferred`

## Full report template

```markdown
# UI Test Report — [App name]

**Website:**
**Date:**
**Tester:**
**Build (if known):**
**Environment:** (local/staging · fresh or messy data)
**Screen size:**
**Roles tested:**

## 1. Summary table

| # | Area | Finding | Severity | Status |
|---|------|---------|----------|--------|

## 2. Counts

- Critical:
- Major:
- Minor:
- Nit:

## 3. What's solid

- …

## 4. Findings

### F-1 — [short title]

- **Severity:**
- **Area:**
- **Logged in as / screen size:**
- **Steps:**
  1. …
  2. …
- **Expected:**
- **Actual:**
- **Proof:** (what you saw / error message)
- **Impact:** (one sentence for real users)

### F-2 — …

## 5. Feature verdicts

| Feature | Role A | Role B | Notes |
|---------|--------|--------|-------|
| | Pass/Fail/Partial | | |

## 6. Fix these first

1. (most harmful first)
2. …

## 7. Retest log (after fixes)

| Bug ID | Result | Notes |
|--------|--------|-------|

## 8. Coverage

**Covered:** …
**Not covered:** …
```

## Quality bar

- Steps start from a known place (who is logged in, which page).
- One behaviour per bug ID.
- Include the error or network status when it helps.
- Do not stuff several issues into one ID.

## What to fix first

1. Security / lost data / wrong money
2. Silent failures and wrong “are you sure?” dialogs
3. Access looking wrong on screen
4. Broken popups and menus
5. Small polish

## Tone

Clear, calm, specific. No blame.
