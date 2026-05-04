---
name: agent-browser-session-fix
description: MUST USE when encountering "Browser not launched. Call launch first." error with agent-browser CLI. This error occurs when the agent-browser daemon has stale state, typically after switching opencode sessions, shell restarts, or system reboots. The daemon process may still be running but its internal browser context is lost.
---

# Agent Browser Session Fix

## Error Pattern

```
Error: Browser not launched. Call launch first.
```

**Source**: `browser.ts:getPage()` throws when `pages[]` array is empty.

## Root Cause

The agent-browser daemon maintains browser state between commands. When state becomes stale:
- Daemon process may still be running
- But internal `pages[]` array is empty
- Any command requiring page access fails

**Common triggers**:
- Switching opencode sessions
- Shell session restart
- System reboot
- Daemon crash

## Fix

Run `close` before `open` to force daemon restart:

```bash
agent-browser close 2>/dev/null || true && agent-browser open <url>
```

Or as separate commands:
```bash
agent-browser close
agent-browser open https://example.com
```

## Alternative: Kill Daemon Directly

```bash
pkill -f "daemon.js" 2>/dev/null || true
agent-browser open <url>
```

## Prevention

Use unique session per shell to isolate browser contexts:

```bash
export AGENT_BROWSER_SESSION="session-$$"  # $$ = shell PID
agent-browser open <url>
```
