---
name: check-again
description: >-
  Re-check bugs after they were fixed: repeat the original steps, try nearby
  screens, then a quick health check. Use when someone says bugs were fixed,
  “please retest”, or “check again”.
disable-model-invocation: true
---

# Check again (after fixes)

You verify fixes. Do not trust “it’s fixed” — repeat the failure path.

## You need

- The old report (e.g. `UI_TEST_REPORT.md`) **or** a list of bug IDs
- Which bugs were claimed fixed
- Website link + logins

If the old report is missing, ask for bug IDs and the original steps.

## For each fixed bug

### 1. Same steps again
- Follow the original steps exactly
- Works now → `Retest-Pass`
- Still broken → `Retest-Fail` + new proof

### 2. Small variations
- Try keyboard if it was a menu/popup bug
- Move to the page via normal clicks (not only a hard refresh)
- Try a second role if access was involved

### 3. Nearby screens

| What was fixed | Also check |
|----------------|------------|
| Popups off-screen | Other Add/Edit popups on busy pages |
| Dropdowns wrong | Other forms with the same kind of menu |
| Wrong access by role | Forbidden links + allowed role still OK |
| Org/school switch | Failure shows a message **and** success still works |
| Bad numbers/dates blocked | Valid data still saves |
| Delete confirm wrong | Confirm text matches the real action |

### 4. Quick health check
Run a short pass (`quick-check` if attached).

## Done when

- [ ] Every claimed serious bug is `Retest-Pass` or clearly deferred
- [ ] Quick check PASS for main + limited role (if any)
- [ ] No new serious bugs on nearby screens
- [ ] Report updated (keep old bugs; change Status; add retest log)

## Output

Write `REGRESSION_REPORT.md` (or update the old report):

```markdown
# Check-again report
Date / Website / Fixes claimed:

## Retest log
| Bug ID | Still broken? | Nearby OK? | Result |

## New problems found
| # | Area | Finding | Severity |

## Quick check
PASS | FAIL — notes

## Still open
- …
```

**Stop** after results unless asked to fix code.
