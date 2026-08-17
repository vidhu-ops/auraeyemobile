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

1. Apply SQL: `scripts/create-crm-tables.sql` (includes `crm_staff` + `crm_leads`)
2. Deploy this branch / copy these files into the live app (`mobileauraeyefinal` / Replit)
3. Log in as `admin` and open `/admin`
4. Open **Staff & permissions** to create a viewer login if someone only needs to look

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

## Note on repos

Cloud Agent can push to `auraeyemobile` only. Merge/copy into `mobileauraeyefinal` / Replit to go live.
