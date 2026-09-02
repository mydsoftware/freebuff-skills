# AGENTS.md — Persistent Learnings

## User Preferences

- User works on germantechsat.ir and 24ghest.ir sites — always reply in Farsi (Persian). They've asked this multiple times and consider it a persistent skill. Never respond in English unless explicitly asked.

## Tool Quirks & Workarounds

### browser-harness (installed via `uv tool install --python 3.12 --upgrade --force browser-harness`)
- On Windows, Chrome's existing user profile blocks `--remote-debugging-port`. Workaround: kill all Chrome, then launch with `--remote-debugging-port=9222 --user-data-dir=C:\tmp\chrome-debug-profile` to get CDP active.
- The "Allow remote debugging" checkbox at `chrome://inspect/#remote-debugging` is NOT sufficient on Windows — CDP port won't open without a clean profile.
- First navigation must use `new_tab(url)`, not `navigate()`.
- Screenshot function is `capture_screenshot()`, not `screenshot()`.
- Skill file lives at `~/.codex/skills/browser-harness/SKILL.md`.
- `uv` installs to `~/.local/bin` on Windows (Git Bash).
