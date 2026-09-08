---
name: Credit ledger authority
description: Durable rules for seeded credit balances, legacy ledger repair, and admin reconciliation.
---

Existing user credit balances are live ledger state, not seed data. Startup seeding may create missing accounts and apply a documented expiry, but it must not restore a CSV balance over deductions, admin adjustments, or a deliberate zero.

**Why:** A startup upsert that used the maximum of the stored and CSV balances silently restored old credits after a correction, making the CRM and transaction history disagree again.

**How to apply:** Treat `users.credits` as the current balance, preserve transaction amounts, and use an explicit owner-triggered reconciliation to add transparent opening/grant records, repair running snapshots, and write audit entries. Keep the operation idempotent.