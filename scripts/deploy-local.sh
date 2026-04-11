#!/bin/bash
# CycleMart — Local Deploy Helper
# Kills old server, builds, starts fresh.
# Usage: bash scripts/deploy-local.sh

set -e
PORT=3099
REPO="$(git rev-parse --show-toplevel)"
LOG="/tmp/cyclemart-prod.log"

echo ""
echo "  ── CycleMart Deploy ──────────────────────"

# 1. Check if old server is running
OLD_PID=$(ss -tlnp | grep ":${PORT}" | grep -oP 'pid=\K[0-9]+' | head -1)
if [ -n "$OLD_PID" ]; then
  echo "  Old server running on :${PORT} (PID $OLD_PID) — killing..."
  kill -9 "$OLD_PID"
  sleep 1
  echo "  Killed."
else
  echo "  No server on :${PORT} — clean start."
fi

# 2. Build
echo "  Building..."
cd "$REPO"
npm run build 2>&1 | tail -4

# 3. Start
echo "  Starting on :${PORT}..."
PORT=$PORT nohup npm start > "$LOG" 2>&1 &
NEW_PID=$!
sleep 4

# 4. Verify
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/)
if [ "$HTTP" = "200" ]; then
  echo "  ✓ Live on :${PORT} (PID $NEW_PID) — HTTP $HTTP"
else
  echo "  ✗ Something went wrong — HTTP $HTTP"
  echo "  Check logs: tail -30 $LOG"
  exit 1
fi

echo "  ──────────────────────────────────────────"
echo ""
