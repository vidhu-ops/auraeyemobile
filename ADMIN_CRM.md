# AuraEye Admin CRM (Phase 1)

Replaces the minimal `/admin` healer tools panel with an operational CRM matching the pitch + mockups.

## What’s included

**Phase 1**
- Dashboard KPIs (users, active / at-risk / churned, healers, 30d revenue, credits)
- Direct Data Control (edit user fields + credit add/subtract/set)
- Complete User Profile (readings, payments, credits, journey phase)
- Healer / Practitioner list + licence/contract API
- Revenue & payments view
- Monthly notifications queue (derived from journey phases)
- Search / filter + CSV export
- Audit log + rollback for user field edits
- GDPR/DPDPA JSON export + erasure (PII scrub + deactivate)
- Integration health indicators (env-based)
- Support tickets scaffold (Phase 2)

## Setup

1. Apply SQL: `scripts/create-crm-tables.sql`
2. Deploy this branch / copy these files into the live app (`mobileauraeyefinal` / Replit)
3. Log in as `admin` and open `/admin`

## Key APIs

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/crm/overview` | KPIs + health + notification cards |
| GET | `/api/crm/users` | Searchable user list |
| GET/PATCH | `/api/crm/users/:id` | Profile + direct edit |
| POST | `/api/crm/users/:id/credits` | Credit adjust |
| GET | `/api/crm/users/:id/export` | GDPR export |
| POST | `/api/crm/users/:id/erase` | Erasure |
| GET | `/api/crm/healers` | Practitioners |
| PUT | `/api/crm/healers/:id/contract` | Licence/contract |
| GET | `/api/crm/revenue` | Payments + credit log |
| GET | `/api/crm/audit-logs` | Audit trail |
| POST | `/api/crm/audit-logs/:id/rollback` | Restore prior user snapshot |
| GET | `/api/crm/users.csv` | CSV export |

## Note on repos

Cloud Agent can push to `auraeyemobile` only. Merge/copy into `mobileauraeyefinal` / Replit to go live.
