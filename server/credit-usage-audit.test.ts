import assert from "node:assert/strict";
import test from "node:test";
import {
  SERVICE_CREDIT_COSTS,
  computeUsageCorrection,
  countBillableReadings,
  creditNumber,
  expectedServiceSpend,
  formatCreditAmount,
  getServiceCreditCost,
} from "../shared/credit-costs";

test("official prices match the platform contract", () => {
  assert.equal(getServiceCreditCost("aura_analysis"), 5);
  assert.equal(getServiceCreditCost("object_analysis"), 1);
  assert.equal(getServiceCreditCost("numerology"), 1);
  assert.equal(getServiceCreditCost("healer_booking"), 0);
  assert.equal(getServiceCreditCost("journaling"), 0);
  assert.equal(getServiceCreditCost("meditation"), 0);
  assert.equal(getServiceCreditCost("vibe_check"), 1);
  assert.equal(SERVICE_CREDIT_COSTS.aura_analysis, 5);
});

test("creditNumber preserves negative balances instead of coercing them to zero", () => {
  assert.equal(creditNumber(-5), -5);
  assert.equal(creditNumber(0), 0);
  assert.equal(creditNumber(null), 0);
  assert.equal(Math.max(0, creditNumber(-8)), 0); // documents the old floor-at-zero bug
  assert.equal(formatCreditAmount(-8), "-8");
  assert.equal(formatCreditAmount(4), "+4");
});

test("Ananya-style undercharge: used services without paying, balance goes negative", () => {
  const usage = {
    aura: 10,
    object: 0,
    numerology: 0,
    vibe: 0,
    healerBookings: 0,
    journals: 4,
    meditations: 2,
  };
  const result = computeUsageCorrection({
    currentCredits: 20,
    usage,
    ledgerServiceNet: 0,
  });
  assert.equal(expectedServiceSpend(usage), 50);
  assert.equal(result.deltaAmount, -50);
  assert.equal(result.newBalance, -30);
  assert.equal(result.hasDiscrepancy, true);
});

test("numerology overcharge of 3 instead of 1 is refunded", () => {
  const usage = {
    aura: 0,
    object: 0,
    numerology: 3,
    vibe: 0,
    healerBookings: 0,
    journals: 0,
    meditations: 0,
  };
  const result = computeUsageCorrection({
    currentCredits: 10,
    usage,
    ledgerServiceNet: -9,
  });
  assert.equal(result.expectedSpend, 3);
  assert.equal(result.deltaAmount, 6);
  assert.equal(result.newBalance, 16);
});

test("object analysis 2-credit charges are repriced to 1", () => {
  const usage = {
    aura: 0,
    object: 4,
    numerology: 0,
    vibe: 0,
    healerBookings: 0,
    journals: 0,
    meditations: 0,
  };
  const result = computeUsageCorrection({
    currentCredits: 8,
    usage,
    ledgerServiceNet: -8,
  });
  assert.equal(result.expectedSpend, 4);
  assert.equal(result.deltaAmount, 4);
  assert.equal(result.newBalance, 12);
});

test("finding a healer is free and previous 3-credit charges are refunded", () => {
  const usage = {
    aura: 0,
    object: 0,
    numerology: 0,
    vibe: 0,
    healerBookings: 2,
    journals: 0,
    meditations: 0,
  };
  const result = computeUsageCorrection({
    currentCredits: 7,
    usage,
    ledgerServiceNet: -6,
  });
  assert.equal(result.expectedSpend, 0);
  assert.equal(result.deltaAmount, 6);
  assert.equal(result.newBalance, 13);
});

test("healer booking bonus credits are reversed because finding a healer is 0", () => {
  const usage = {
    aura: 0,
    object: 0,
    numerology: 0,
    vibe: 0,
    healerBookings: 0,
    journals: 0,
    meditations: 0,
  };
  const result = computeUsageCorrection({
    currentCredits: 151,
    usage,
    ledgerServiceNet: 1,
  });
  assert.equal(result.expectedSpend, 0);
  assert.equal(result.deltaAmount, -1);
  assert.equal(result.newBalance, 150);
});

test("correction is idempotent once the usage_correction is in the ledger", () => {
  const usage = {
    aura: 4,
    object: 2,
    numerology: 1,
    vibe: 1,
    healerBookings: 1,
    journals: 3,
    meditations: 1,
  };
  const first = computeUsageCorrection({
    currentCredits: 20,
    usage,
    ledgerServiceNet: -6,
  });
  assert.equal(first.expectedSpend, 5 * 4 + 2 + 1 + 1);
  const second = computeUsageCorrection({
    currentCredits: first.newBalance,
    usage,
    ledgerServiceNet: -6 + first.deltaAmount,
  });
  assert.equal(second.hasDiscrepancy, false);
  assert.equal(second.deltaAmount, 0);
  assert.equal(second.newBalance, first.newBalance);
});

test("healers are billed for readings they performed, not client-owned rows", () => {
  const rows = [
    { userId: 10, performedBy: 2 },
    { userId: 2, performedBy: 2 },
    { userId: 10, performedBy: null },
  ];
  assert.equal(countBillableReadings(2, true, rows), 2);
  assert.equal(countBillableReadings(10, false, rows), 1);
});
