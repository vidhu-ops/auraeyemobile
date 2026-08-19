#!/usr/bin/env bash
# Run AFTER replit-install-crm.sh — from /home/runner/workspace
#   bash scripts/replit-finish-setup.sh

set -euo pipefail

cd "$(dirname "$0")/.." || exit 1
echo "=== AuraEye CRM finish setup ==="
echo "Directory: $(pwd)"
echo ""

# 1) Check files
echo "1) Checking CRM files..."
for f in \
  client/src/pages/admin-crm/AdminCrmApp.tsx \
  client/src/pages/admin-crm/PeopleWorkspace.tsx \
  server/crm-routes.ts \
  scripts/create-crm-tables.sql \
  scripts/reset-rutima-password.ts; do
  if [[ -f "$f" ]]; then
    echo "   OK  $f"
  else
    echo "   MISSING $f — run install first:"
    echo "   curl -fsSL https://raw.githubusercontent.com/vidhu-ops/auraeyemobile/cursor/admin-crm-ux-overhaul-5e41/scripts/replit-install-crm.sh | bash"
    exit 1
  fi
done

# 2) Database
echo ""
echo "2) Database tables..."
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "   WARNING: DATABASE_URL not set in this shell."
  echo "   → Open Replit Secrets and ensure DATABASE_URL exists."
  echo "   → Or paste scripts/create-crm-tables.sql into the Replit Database SQL tab manually."
else
  if command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -f scripts/create-crm-tables.sql && echo "   OK  SQL applied"
  else
    echo "   psql not found — paste scripts/create-crm-tables.sql into Replit Database UI"
  fi
fi

# 3) Rutima password
echo ""
echo "3) Reset Rutima Gopala password..."
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "   SKIP (need DATABASE_URL). After setting it, run:"
  echo "   npx tsx scripts/reset-rutima-password.ts"
else
  npx tsx scripts/reset-rutima-password.ts || echo "   (If this failed, check DATABASE_URL and that Rutima exists in users table)"
fi

echo ""
echo "=== DONE ==="
echo ""
echo "IMPORTANT: You do NOT need to cd to mobileauraeyefinal or mobileauraeye."
echo "You are already in the correct folder: $(pwd)"
echo ""
echo "Last step: click STOP then RUN in Replit to restart the app."
echo "Then log in as admin and open:  /admin"
echo ""
echo "Rutima login: username = Rutima Gopala   password = healer123"
