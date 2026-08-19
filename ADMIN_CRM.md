# AuraEye Admin CRM

Replaces the minimal `/admin` healer tools panel with an operational CRM matching the pitch + mockups.

## What’s included

**Phase 1**
- Dashboard KPIs (users, active / needs-attention / inactive-long-quiet, healers, 30d revenue, credits)
- Direct Data Control (edit user fields + credit add/subtract/set **with expiry**)
- **Create user / healer accounts** from CRM (username, password, starting credits, how long credits stay active)
- Credit grants expire automatically; unused balance is removed when the grant ends
- Complete User Profile with **full activity timeline** (aura, vibe, numerology, objects, journals, meditations, logins, payments, credits)
- Healer / Practitioner list + licence/contract editor in UI
- Revenue & payments view (GBP/INR entity soft filter + refund log)
- Monthly notifications queue (derived from journey phases)
- Search / filter + CSV export
- Audit log + rollback for user field edits
- GDPR/DPDPA JSON export + erasure (PII scrub + deactivate)
- Integration health indicators (env-based)

**Phase 2**
- Support ticketing (create / start / resolve in UI)
  - **Also auto-ingests** contact form, Help “Submit a Ticket”, aura/object reviews, vibe feedback, healer booking messages & replies
- Lead pipeline (new → contacted → qualified → onboarded / lost)

**Phase 3**
- **Staff & permissions** — create username/password logins for `/admin`
  - **Viewer** — look only
  - **Editor** — edit users/credits/healers
  - **Support** — tickets + view users
  - **Owner** — full access (also the classic `admin` account)
- Analytics / feature usage reporting

## Journey phases (plain language)

| Key | Label shown in CRM |
|-----|--------------------|
| `new` | New |
| `active` | Active |
| `at-risk` | Needs attention |
| `dormant` | Inactive — long quiet |

(`churned` was renamed to `dormant` because it was unclear.)

## Setup

### Replit — copy & paste this (fixes "no such file or directory")

The install script is **not** on Replit until you download it. Paste **one** of these into the **Shell** (from your app root — the folder with `client/` and `server/`):

**Option A — one command (recommended):**
```bash
curl -fsSL https://raw.githubusercontent.com/vidhu-ops/auraeyemobile/cursor/admin-crm-ux-overhaul-5e41/scripts/replit-install-crm.sh | bash
```

**Then finish setup (SQL + Rutima password):**
```bash
bash scripts/replit-finish-setup.sh
```

**You do NOT need** `cd ~/mobileauraeyefinal` — on Replit your app is already at `/home/runner/workspace`.

**Option B — if Option A fails, run step by step:**
```bash
pwd
ls client server
mkdir -p scripts client/src/pages/admin-crm
curl -fsSL https://raw.githubusercontent.com/vidhu-ops/auraeyemobile/cursor/admin-crm-ux-overhaul-5e41/scripts/replit-install-crm.sh -o scripts/replit-install-crm.sh
bash scripts/replit-install-crm.sh
```

If you see `no such file or directory` for `scripts/apply-crm-upgrade.sh`, you ran the old command before downloading — use **Option A** above instead.

Then:
1. Run SQL: `scripts/create-crm-tables.sql` in your database
2. **Stop → Run** to restart Replit
3. Log in as `admin` → open `/admin`

**Reset Rutima Gopala password:**
```bash
npx tsx scripts/reset-rutima-password.ts
```

### Manual setup (if you have the repo)

## Key APIs

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/crm/overview` | KPIs + health + notification cards |
| GET/POST | `/api/crm/users` | List users / **create** user or healer |
| GET/PATCH | `/api/crm/users/:id` | Profile + timeline + direct edit |
| POST | `/api/crm/users/:id/credits` | Credit adjust (+ optional `creditValidityDays`) |
| GET | `/api/crm/users/:id/export` | GDPR export |
| POST | `/api/crm/users/:id/erase` | Erasure |
| GET/POST/PATCH | `/api/crm/staff` | Staff logins & roles |
| GET | `/api/crm/healers` | Practitioners |
| PUT | `/api/crm/healers/:id/contract` | Licence/contract |
| GET | `/api/crm/revenue` | Payments + credit/refund log |
| GET/POST/PATCH | `/api/crm/tickets` | Support tickets |
| GET/POST/PATCH | `/api/crm/leads` | Lead pipeline |
| GET | `/api/crm/audit-logs` | Audit trail |
| POST | `/api/crm/audit-logs/:id/rollback` | Restore prior user snapshot |
| GET | `/api/crm/users.csv` | CSV export |

## UX (simple mode)

Navigation is reduced to **6 sections** so admins rarely switch screens:

| Menu | What you do here |
|------|------------------|
| **Home** | Today's numbers, open tickets (resolve inline), who to check on, analytics summary |
| **People** | Search anyone → view activity, edit, credits, healer paperwork, messages — **one screen** |
| **Money** | Payments, refunds, credit expiry log |
| **Messages & leads** | Support inbox + lead pipeline |
| **Team access** | Create viewer/editor staff logins |
| **Activity log** | Audit trail + undo |

The **feature checklist** on Home maps line-by-line to this spec document.


Cloud Agent can push to `auraeyemobile` only. Merge/copy into `mobileauraeyefinal` / Replit to go live.
