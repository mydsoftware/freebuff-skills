---
name: quick-check
description: >-
  Fast 15–20 minute website health check: can people log in, open menus, and
  sign out without crashes. Use when someone asks for a quick check, smoke
  test, sanity check, or “does it still work?”.
disable-model-invocation: true
---

# Quick check

Short health check only. Prove the site opens and basic navigation works. Do not deep-test every feature unless something fails and you must explain why.

## You need

- Website link
- At least one login (prefer an admin and one limited role if you have both)
- Screen about 1440×900 wide

## Checklist (15–20 min)

```
Quick check:
- [ ] 1. Wrong password shows a clear error
- [ ] 2. Correct login reaches the home/landing page
- [ ] 3. Each main menu item opens (no blank/white page)
- [ ] 4. No scary console errors while clicking around
- [ ] 5. One simple save or create works (if obvious)
- [ ] 6. Sign out returns to login
- [ ] 7. Limited role (if any): forbidden menus are hidden
- [ ] 8. Limited role: typing a forbidden link does not open a full editor that looks allowed
- [ ] 9. Refresh on home still works
- [ ] 10. Narrow/phone width: login + home still usable
```

## Pass or fail

- **Pass:** applicable checks OK (tiny polish nits allowed)
- **Fail:** any Critical/Major on this list → stop and list the bugs

## Output

```markdown
# Quick check report
Website / Date / Result: PASS | FAIL

## Failed checks
- …

## Notes
- …
```

If FAIL, add short steps for each serious bug. For a full deep test, use `test-website` and `write-bug-report`.
