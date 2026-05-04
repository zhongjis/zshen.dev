#!/usr/bin/env bash
# Cleanup stale agent-browser daemons from different nix store paths.
#
# The agent-browser daemon persists in the background and caches the
# PLAYWRIGHT_BROWSERS_PATH from when it was started. When the nix store
# path changes (e.g., after flake update), the old daemon continues using
# stale browser paths, causing version mismatches.
#
# This script kills only daemons from DIFFERENT store paths, preserving
# daemons from other projects that may be using their own agent-browser.
#
# Usage: cleanup-stale-agent-browser.sh <current-agent-browser-store-path>

set -euo pipefail

current_agent_browser_path="${1:-}"

if [[ -z "$current_agent_browser_path" ]]; then
  echo "Usage: $0 <current-agent-browser-store-path>" >&2
  exit 1
fi

# Find daemon.js processes
daemon_pids=$(pgrep -f "daemon.js" 2>/dev/null || true)

if [[ -z "$daemon_pids" ]]; then
  # No daemons running, nothing to do
  exit 0
fi

stale_pids=""

for pid in $daemon_pids; do
  # Skip if process no longer exists
  [[ -d "/proc/$pid" ]] || continue
  
  # Get the command line to verify it's an agent-browser daemon
  cmdline=$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)
  
  # Only consider agent-browser daemons
  if [[ "$cmdline" != *"agent-browser"* ]]; then
    continue
  fi
  
  # Check if this daemon is from a different store path
  if [[ "$cmdline" != *"$current_agent_browser_path"* ]]; then
    stale_pids="$stale_pids $pid"
  fi
done

# Trim leading space
stale_pids="${stale_pids# }"

if [[ -n "$stale_pids" ]]; then
  echo "Killing stale agent-browser daemons from old nix store paths: $stale_pids"
  for pid in $stale_pids; do
    kill "$pid" 2>/dev/null || true
  done
fi
