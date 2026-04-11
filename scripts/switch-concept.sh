#!/bin/bash
# CycleMart — CI Concept Switcher
# Usage: bash scripts/switch-concept.sh [a|b|c|d|e|f|baseline]
#
# A = Precision Red    #CC1F2D
# B = Signal Orange    #EA580C
# C = Electric Blue    #2563EB
# D = Volt Green       #65A30D
# E = Titanium Gold    #D4A017
# F = White Only       #FFFFFF (no accent)
# baseline = revert to v-baseline-2026-03-29

set -e

CONCEPT="${1:-baseline}"
REPO="$(git rev-parse --show-toplevel)"
TAILWIND="$REPO/tailwind.config.js"
GLOBALS="$REPO/app/globals.css"

# ── Colour map ─────────────────────────────────────────────────────
case "$CONCEPT" in
  a|A)
    ACCENT="#CC1F2D"; ACCENT_HOVER="#A8172A"; ACCENT_GHOST="rgba(204,31,45,0.06)"
    ACCENT_RING="rgba(204,31,45,0.15)"; ACCENT_H="358 74% 46%"
    NAME="A · Precision Red"
    ;;
  b|B)
    ACCENT="#EA580C"; ACCENT_HOVER="#C44A0A"; ACCENT_GHOST="rgba(234,88,12,0.06)"
    ACCENT_RING="rgba(234,88,12,0.15)"; ACCENT_H="21 90% 48%"
    NAME="B · Signal Orange"
    ;;
  c|C)
    ACCENT="#2563EB"; ACCENT_HOVER="#1D4FBF"; ACCENT_GHOST="rgba(37,99,235,0.06)"
    ACCENT_RING="rgba(37,99,235,0.15)"; ACCENT_H="221 83% 53%"
    NAME="C · Electric Blue"
    ;;
  d|D)
    ACCENT="#65A30D"; ACCENT_HOVER="#4D7A09"; ACCENT_GHOST="rgba(101,163,13,0.06)"
    ACCENT_RING="rgba(101,163,13,0.15)"; ACCENT_H="84 92% 34%"
    NAME="D · Volt Green"
    ;;
  e|E)
    ACCENT="#D4A017"; ACCENT_HOVER="#AA8012"; ACCENT_GHOST="rgba(212,160,23,0.06)"
    ACCENT_RING="rgba(212,160,23,0.15)"; ACCENT_H="42 80% 48%"
    NAME="E · Titanium Gold"
    ;;
  f|F)
    ACCENT="#FFFFFF"; ACCENT_HOVER="#E8E8E8"; ACCENT_GHOST="rgba(255,255,255,0.06)"
    ACCENT_RING="rgba(255,255,255,0.15)"; ACCENT_H="0 0% 100%"
    NAME="F · White Only"
    ;;
  baseline)
    echo ""
    echo "  Reverting to baseline tag: v-baseline-2026-03-29"
    git checkout v-baseline-2026-03-29 -- app/globals.css tailwind.config.js
    # Ensure --color-night-ride is present (added after baseline tag was created)
    python3 - <<PYEOF
import re
with open('app/globals.css', 'r') as f:
    content = f.read()
if '--color-night-ride' not in content:
    content = content.replace(
        '--color-primary-ghost:',
        '--color-night-ride: #0D1B2A;\n  --color-night-ride-dark: #09121D;\n  --color-primary-ghost:'
    )
    with open('app/globals.css', 'w') as f:
        f.write(content)
    print("  Injected --color-night-ride into restored globals.css")
PYEOF
    echo "  Done. Restored baseline colours."
    echo ""
    exit 0
    ;;
  *)
    echo "Usage: bash scripts/switch-concept.sh [a|b|c|d|e|f|baseline]"
    exit 1
    ;;
esac

# ── Base: always Night Ride #0D1B2A ────────────────────────────────
# NOTE: --color-night-ride is FIXED and NEVER changed by concept switcher.
# Footer, nav, and CTA banners use --color-night-ride for backgrounds.
# --color-primary = accent only (buttons, labels, logo text).
BASE="#0D1B2A"
BASE_DARK="#09121D"

echo ""
echo "  Switching to Concept $NAME"
echo "  Accent:  $ACCENT"
echo "  Base:    $BASE (Night Ride — fixed)"
echo ""

# ── Patch tailwind.config.js ────────────────────────────────────────
# Replace primary colour block
python3 - <<PYEOF
import re, sys

with open('$TAILWIND', 'r') as f:
    content = f.read()

# Replace primary block
old = re.search(r"primary:\s*\{[^}]+\}", content, re.DOTALL)
if old:
    new_block = """primary: {
          DEFAULT: '$ACCENT',
          hover: '$ACCENT_HOVER',
          foreground: '#ffffff',
          ghost: '$ACCENT_GHOST',
          ring: '$ACCENT_RING',
        }"""
    content = content[:old.start()] + new_block + content[old.end():]

with open('$TAILWIND', 'w') as f:
    f.write(content)

print("  tailwind.config.js updated")
PYEOF

# ── Patch globals.css ───────────────────────────────────────────────
python3 - <<PYEOF
content = open('$GLOBALS').read()
# Always ensure --color-night-ride is present (fixed dark surface colour)
if '--color-night-ride' not in content:
    content = content.replace(
        '--color-primary-ghost:',
        '--color-night-ride: #0D1B2A;\n  --color-night-ride-dark: #09121D;\n  --color-primary-ghost:'
    )
    print("  Ensured --color-night-ride present")

import re

# Replace CSS custom properties — accent/primary
replacements = [
    # --color-primary (used by cm- classes)
    (r'--color-primary:\s*#[0-9a-fA-F]{3,8}', f'--color-primary: $ACCENT'),
    (r'--color-primary-dark:\s*#[0-9a-fA-F]{3,8}', f'--color-primary-dark: $ACCENT_HOVER'),
    # shadcn --primary HSL
    (r'--primary:\s*[\d.]+\s+[\d.]+%\s+[\d.]+%', f'--primary: $ACCENT_H'),
    # inline hex refs to old accent colours (common cycling brand reds/blues)
    (r'background:\s*#273970', f'background: $BASE'),
    (r'#273970', '$ACCENT'),
    (r'#1E2E5C', '$ACCENT_HOVER'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# cm-btn-primary background
content = re.sub(
    r'(\.cm-btn-primary\s*\{[^}]*background:\s*)#[0-9a-fA-F]{3,8}',
    rf'\g<1>$ACCENT',
    content
)
content = re.sub(
    r'(\.cm-btn-primary:hover\s*\{\s*background:\s*)#[0-9a-fA-F]{3,8}',
    rf'\g<1>$ACCENT_HOVER',
    content
)

open('$GLOBALS', 'w').write(content)
print("  globals.css updated")
PYEOF

# ── Commit to concept branch ────────────────────────────────────────
BRANCH="concept-$(echo $CONCEPT | tr '[:upper:]' '[:lower:]')-$(echo $NAME | tr ' ·' '-' | tr -d '#' | tr '[:upper:]' '[:lower:]' | sed 's/---/-/g' | sed 's/-$//')"
BRANCH=$(echo $BRANCH | sed 's/[^a-z0-9-]/-/g' | sed 's/--/-/g')

# Stage colour files
git add app/globals.css tailwind.config.js

# Check if there are staged changes
if git diff --cached --quiet; then
    echo "  No colour changes detected (files already match this concept)."
else
    git commit -m "ci: apply concept $CONCEPT — $NAME"
    echo "  Committed to current branch"
fi

echo ""
echo "  ✓ Concept $NAME applied."
echo "  To revert: bash scripts/switch-concept.sh baseline"
echo "  To preview: restart dev server (already running on :3099)"
echo ""
