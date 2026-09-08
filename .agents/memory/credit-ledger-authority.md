---
name: Credit ledger authority
description: Durable rules for seeded credit balances, official service prices, usage correction, and negative balances.
---

Existing user credit balances are live ledger state, not seed data. Startup seeding may create missing accounts and apply a documented expiry, but it must not restore a CSV balance over deductions, admin adjustments, a deliberate zero, or a negative usage correction.

Official prices are in `shared/credit-costs.ts` and must be used for deductions, UI labels, and historical usage correction:

- Aura analysis: 5
- Object analysis: 1
- Numerology: 1
- Finding a healer: 0
- Journaling: 0
- Meditation: 0
- Vibe check: 1

Never coerce credits with `value || 0` — that hides negative balances. Use `?? 0` or `creditNumber()`.

Startup and CRM usage correction compare recorded activity to those prices, write a `usage_correction` ledger row, and may take `users.credits` negative. The operation is idempotent. Paid services still require a non-negative balance going forward; free services (find healer, journal, meditation) do not.
