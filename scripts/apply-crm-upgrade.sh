#!/usr/bin/env bash
# Apply Admin CRM v1.1 files from auraeyemobile into a mobileauraeyefinal / Replit checkout.
# Run from the app root (where client/ and server/ exist).

set -euo pipefail
BRANCH="${1:-cursor/admin-crm-phase1-5e41}"
BASE="https://raw.githubusercontent.com/vidhu-ops/auraeyemobile/${BRANCH}"

mkdir -p client/src/pages/admin-crm scripts

curl -fsSL -o client/src/pages/admin.tsx "$BASE/client/src/pages/admin.tsx"
curl -fsSL -o client/src/pages/admin-crm/AdminCrmApp.tsx "$BASE/client/src/pages/admin-crm/AdminCrmApp.tsx"
curl -fsSL -o client/src/pages/admin-crm/types.ts "$BASE/client/src/pages/admin-crm/types.ts"
curl -fsSL -o server/crm-routes.ts "$BASE/server/crm-routes.ts"
curl -fsSL -o server/auth.ts "$BASE/server/auth.ts"
curl -fsSL -o shared/schema.ts "$BASE/shared/schema.ts"
curl -fsSL -o scripts/create-crm-tables.sql "$BASE/scripts/create-crm-tables.sql"
curl -fsSL -o ADMIN_CRM.md "$BASE/ADMIN_CRM.md"

# Ensure routes register CRM (idempotent check)
if ! grep -q "registerCrmRoutes" server/routes.ts 2>/dev/null; then
  echo "WARNING: server/routes.ts may not call registerCrmRoutes — wire it if missing."
fi

echo ""
echo "Files copied. Next:"
echo "1) Run SQL in scripts/create-crm-tables.sql (or the crm_staff / crm_leads block)"
echo "2) Restart the Replit app"
echo "3) Log in as admin → /admin → Staff & permissions to create viewer logins"
