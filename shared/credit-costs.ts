/**
 * Canonical platform credit prices.
 * Every deduction, UI label, and historical usage correction must use these values.
 */
export const SERVICE_CREDIT_COSTS = {
  aura_analysis: 5,
  object_analysis: 1,
  numerology: 1,
  healer_booking: 0,
  vibe_check: 1,
  journaling: 0,
  meditation: 0,
} as const;

export type ServiceCreditType = keyof typeof SERVICE_CREDIT_COSTS;

export const USAGE_CORRECTION_TYPE = "usage_correction";

/** Ledger types that represent service use / related bonuses, used for usage reconciliation. */
export const SERVICE_LEDGER_TYPES = new Set([
  "aura_analysis",
  "object_analysis",
  "numerology",
  "healer_booking",
  "healer_booking_credit",
  "vibe_check",
  "vibe_analysis",
  "journaling",
  "journal",
  "meditation",
  USAGE_CORRECTION_TYPE,
]);

export function creditNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function getServiceCreditCost(serviceType: string): number {
  if (serviceType === "vibe_analysis") return SERVICE_CREDIT_COSTS.vibe_check;
  if (serviceType in SERVICE_CREDIT_COSTS) {
    return SERVICE_CREDIT_COSTS[serviceType as ServiceCreditType];
  }
  return 0;
}

export function formatCreditAmount(value: unknown): string {
  const n = creditNumber(value);
  if (n > 0) return `+${n}`;
  return String(n);
}

export function isHealerAccountType(userType: string | null | undefined): boolean {
  return userType === "healer" || userType === "semi-healer" || userType === "semi_healer";
}

export type ServiceUsageCounts = {
  aura: number;
  object: number;
  numerology: number;
  vibe: number;
  healerBookings: number;
  journals: number;
  meditations: number;
};

export function expectedServiceSpend(usage: ServiceUsageCounts): number {
  return (
    usage.aura * SERVICE_CREDIT_COSTS.aura_analysis +
    usage.object * SERVICE_CREDIT_COSTS.object_analysis +
    usage.numerology * SERVICE_CREDIT_COSTS.numerology +
    usage.vibe * SERVICE_CREDIT_COSTS.vibe_check +
    usage.healerBookings * SERVICE_CREDIT_COSTS.healer_booking +
    usage.journals * SERVICE_CREDIT_COSTS.journaling +
    usage.meditations * SERVICE_CREDIT_COSTS.meditation
  );
}

export type UsageCorrectionMath = {
  expectedSpend: number;
  expectedNet: number;
  ledgerServiceNet: number;
  deltaAmount: number;
  newBalance: number;
  hasDiscrepancy: boolean;
};

/**
 * Compare recorded service-ledger net to expected spend at official prices.
 * deltaAmount is applied to the current balance (negative = charge more / can go negative).
 */
export function computeUsageCorrection(input: {
  currentCredits: number;
  usage: ServiceUsageCounts;
  ledgerServiceNet: number;
}): UsageCorrectionMath {
  const expectedSpend = expectedServiceSpend(input.usage);
  const expectedNet = -expectedSpend;
  const deltaAmount = expectedNet - input.ledgerServiceNet;
  const newBalance = creditNumber(input.currentCredits) + deltaAmount;
  return {
    expectedSpend,
    expectedNet,
    ledgerServiceNet: input.ledgerServiceNet,
    deltaAmount,
    newBalance,
    hasDiscrepancy: deltaAmount !== 0,
  };
}

export function countBillableReadings(
  userId: number,
  isHealer: boolean,
  rows: Array<{ userId: number | null; performedBy: number | null }>,
): number {
  if (isHealer) {
    return rows.filter((row) => row.performedBy === userId).length;
  }
  return rows.filter(
    (row) => row.userId === userId && (row.performedBy == null || row.performedBy === userId),
  ).length;
}
