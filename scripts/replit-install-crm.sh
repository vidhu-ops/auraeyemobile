#!/usr/bin/env bash
# Paste this ENTIRE file into Replit Shell, OR run:
#   curl -fsSL https://raw.githubusercontent.com/vidhu-ops/auraeyemobile/cursor/admin-crm-fixes-5e41/scripts/replit-install-crm.sh | bash
#
# Must run from your app root (folder that contains client/ and server/).

set -euo pipefail

BRANCH="${CRM_BRANCH:-cursor/admin-crm-fixes-5e41}"
BASE="https://raw.githubusercontent.com/vidhu-ops/auraeyemobile/${BRANCH}"

# Find app root if we're in the wrong folder
if [[ ! -d client ]] || [[ ! -d server ]]; then
  if [[ -d ../client ]] && [[ -d ../server ]]; then
    cd ..
  else
    echo "ERROR: Run this from your Replit app root (the folder with client/ and server/)."
    echo "Current directory: $(pwd)"
    echo "Try: cd \$(find . -maxdepth 3 -type d -name client 2>/dev/null | head -1 | xargs dirname)"
    exit 1
  fi
fi

echo "Installing Admin CRM from branch: $BRANCH"
echo "App root: $(pwd)"
mkdir -p client/src/pages/admin-crm client/src/components scripts

download() {
  local dest="$1"
  local url="$2"
  mkdir -p "$(dirname "$dest")"
  if ! curl -fsSL "$url" -o "$dest"; then
    echo "FAILED to download: $url"
    exit 1
  fi
  echo "  ok $dest"
}

download client/src/pages/admin.tsx "$BASE/client/src/pages/admin.tsx"
download client/src/pages/admin-crm/AdminCrmApp.tsx "$BASE/client/src/pages/admin-crm/AdminCrmApp.tsx"
download client/src/pages/admin-crm/types.ts "$BASE/client/src/pages/admin-crm/types.ts"
download client/src/pages/admin-crm/theme.ts "$BASE/client/src/pages/admin-crm/theme.ts"
download client/src/pages/admin-crm/HelpTip.tsx "$BASE/client/src/pages/admin-crm/HelpTip.tsx"
download client/src/pages/admin-crm/PeopleWorkspace.tsx "$BASE/client/src/pages/admin-crm/PeopleWorkspace.tsx"
download client/src/pages/admin-crm/InboxWorkspace.tsx "$BASE/client/src/pages/admin-crm/InboxWorkspace.tsx"
download client/src/pages/admin-crm/InsightsWorkspace.tsx "$BASE/client/src/pages/admin-crm/InsightsWorkspace.tsx"
download client/src/pages/admin-crm/QuickActionDialog.tsx "$BASE/client/src/pages/admin-crm/QuickActionDialog.tsx"
download client/src/pages/admin-crm/FileImportPanel.tsx "$BASE/client/src/pages/admin-crm/FileImportPanel.tsx"
download client/src/components/PageViewTracker.tsx "$BASE/client/src/components/PageViewTracker.tsx"
download client/src/App.tsx "$BASE/client/src/App.tsx"
download client/index.html "$BASE/client/index.html"
download server/support-tickets.ts "$BASE/server/support-tickets.ts"
download server/crm-routes.ts "$BASE/server/crm-routes.ts"
download server/crm-insights.ts "$BASE/server/crm-insights.ts"
download server/activity-tracker.ts "$BASE/server/activity-tracker.ts"
download server/credit-grants.ts "$BASE/server/credit-grants.ts"
download server/auth.ts "$BASE/server/auth.ts"
download server/storage.ts "$BASE/server/storage.ts"
download server/routes.ts "$BASE/server/routes.ts"
download server/index.ts "$BASE/server/index.ts"
download shared/schema.ts "$BASE/shared/schema.ts"
download client/src/components/forms/contact-form.tsx "$BASE/client/src/components/forms/contact-form.tsx"
download client/src/pages/help.tsx "$BASE/client/src/pages/help.tsx"
download scripts/create-crm-tables.sql "$BASE/scripts/create-crm-tables.sql"
download scripts/reset-rutima-password.ts "$BASE/scripts/reset-rutima-password.ts"
download ADMIN_CRM.md "$BASE/ADMIN_CRM.md"

echo ""
echo "Done! Files installed."
echo ""
echo "Next steps:"
echo "  1) Run SQL:  psql \$DATABASE_URL -f scripts/create-crm-tables.sql"
echo "     (or paste scripts/create-crm-tables.sql into Replit Database pane)"
echo "  2) Restart the Replit app (Stop → Run)"
echo "  3) Log in as admin and open /admin"
echo ""
echo "Reset Rutima password:"
echo "  npx tsx scripts/reset-rutima-password.ts"
