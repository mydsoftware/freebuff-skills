---
name: who-can-access
description: >-
  Check who can open which pages: menus, direct links, edit vs view-only,
  and clear messages when access is denied. Use when someone asks about
  roles, permissions, “can teachers open this?”, or forbidden pages.
disable-model-invocation: true
---

# Who can access

Test access like a real user. Use a **separate browser window per role**. Never stay logged in as admin and pretend to be a limited user.

## Goal

What people **see** must match what they **can do**. Hiding a menu is not enough if the link still opens a full editor. A quiet failure with no message is a bug.

## Fill this table for the app

| Page or action | Role A | Role B | Role C |
|----------------|--------|--------|--------|
| Menu item shown? | | | |
| Direct link allowed? | allow / blocked / redirect | | |
| Can read? | | | |
| Can add/edit/delete? | | | |

Use: `✓` allowed · `✗` blocked · `looks open but empty` (**Major**)

## Checklist

```
Access check:
- [ ] Each role can sign in where they should
- [ ] Menus match the role
- [ ] Forbidden direct links → clear “no access” / redirect — not a full empty form
- [ ] Dangerous actions hidden or confirmed, with a clear error if denied
- [ ] Limited roles cannot change powerful settings (roles, billing, org)
- [ ] Switching school/org: success works; failure shows a message (never silent)
- [ ] After demotion (if you can test it): old session stops working soon
```

## Common serious bugs

1. Page looks fully open but data never loads (access denied quietly)
2. Switch/deny with no message
3. Confirm popup text from a previous action (e.g. Remove shows “Change role?”)
4. Menu hidden but typing the URL still edits everything

## Output

```markdown
# Who-can-access report
Website / Date / Roles:

## Matrix
| Page/action | …roles… |

## Findings
### P-1 …
```

Use severity levels from `test-website`. Can fold into a full report if this is part of one.
