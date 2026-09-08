import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "./db";
import {
  auraReadings,
  creditGrants,
  creditTransactions,
  healerBookings,
  journals,
  meditationSessions,
  numerologyReadings,
  objectAnalyses,
  users,
  vibeReadings,
} from "../shared/schema";
import {
  SERVICE_LEDGER_TYPES,
  USAGE_CORRECTION_TYPE,
  computeUsageCorrection,
  countBillableReadings,
  creditNumber,
  expectedServiceSpend,
  getServiceCreditCost,
  isHealerAccountType,
  type ServiceUsageCounts,
} from "../shared/credit-costs";

export type CreditUsageAccountReport = {
  userId: number;
  username: string;
  userType: string;
  currentCredits: number;
  usage: ServiceUsageCounts;
  expectedSpend: number;
  charged: {
    aura: number;
    object: number;
    numerology: number;
    vibe: number;
    healerBookings: number;
    healerBookingCredits: number;
    otherServices: number;
    corrections: number;
  };
  ledgerServiceNet: number;
  deltaAmount: number;
  newBalance: number;
  hasDiscrepancy: boolean;
  willBeNegative: boolean;
};

export type CreditUsageAuditReport = {
  generatedAt: string;
  prices: {
    aura_analysis: number;
    object_analysis: number;
    numerology: number;
    healer_booking: number;
    vibe_check: number;
    journaling: number;
    meditation: number;
  };
  totalUsers: number;
  accountsWithDiscrepancy: number;
  negativeAfterCorrection: number;
  alreadyNegative: number;
  accounts: CreditUsageAccountReport[];
};

export type CreditUsageCorrectionResult = {
  generatedAt: string;
  usersProcessed: number;
  usersChanged: number;
  negativeBalances: number;
  changedUsers: Array<{
    userId: number;
    username: string;
    creditsBefore: number;
    creditsAfter: number;
    deltaAmount: number;
  }>;
  report: CreditUsageAuditReport;
};

function chargedFromTransactions(rows: Array<{ transactionType: string; amount: number }>) {
  const charged = {
    aura: 0,
    object: 0,
    numerology: 0,
    vibe: 0,
    healerBookings: 0,
    healerBookingCredits: 0,
    otherServices: 0,
    corrections: 0,
  };
  let ledgerServiceNet = 0;
  for (const row of rows) {
    const amount = creditNumber(row.amount);
    if (SERVICE_LEDGER_TYPES.has(row.transactionType)) {
      ledgerServiceNet += amount;
    }
    if (row.transactionType === "aura_analysis" && amount < 0) charged.aura += -amount;
    else if (row.transactionType === "object_analysis" && amount < 0) charged.object += -amount;
    else if (row.transactionType === "numerology" && amount < 0) charged.numerology += -amount;
    else if ((row.transactionType === "vibe_check" || row.transactionType === "vibe_analysis") && amount < 0) {
      charged.vibe += -amount;
    } else if (row.transactionType === "healer_booking" && amount < 0) charged.healerBookings += -amount;
    else if (row.transactionType === "healer_booking_credit" && amount > 0) charged.healerBookingCredits += amount;
    else if (row.transactionType === USAGE_CORRECTION_TYPE) charged.corrections += amount;
    else if (
      (row.transactionType === "journaling" ||
        row.transactionType === "journal" ||
        row.transactionType === "meditation") &&
      amount < 0
    ) {
      charged.otherServices += -amount;
    }
  }
  return { charged, ledgerServiceNet };
}

export async function getCreditUsageAuditReport(): Promise<CreditUsageAuditReport> {
  const [
    allUsers,
    allTransactions,
    auraRows,
    objectRows,
    numerologyRows,
    vibeRows,
    bookingRows,
    journalRows,
    meditationRows,
  ] = await Promise.all([
    db.select().from(users).orderBy(asc(users.id)),
    db.select().from(creditTransactions),
    db.select({ userId: auraReadings.userId, performedBy: auraReadings.performedBy }).from(auraReadings),
    db.select({ userId: objectAnalyses.userId, performedBy: objectAnalyses.performedBy }).from(objectAnalyses),
    db
      .select({ userId: numerologyReadings.userId, performedBy: numerologyReadings.performedBy })
      .from(numerologyReadings),
    db.select({ userId: vibeReadings.userId }).from(vibeReadings),
    db.select({ userId: healerBookings.userId }).from(healerBookings),
    db.select({ userId: journals.userId }).from(journals),
    db.select({ userId: meditationSessions.userId }).from(meditationSessions),
  ]);

  const txByUser = new Map<number, Array<{ transactionType: string; amount: number }>>();
  for (const tx of allTransactions) {
    const rows = txByUser.get(tx.userId) || [];
    rows.push({ transactionType: tx.transactionType, amount: creditNumber(tx.amount) });
    txByUser.set(tx.userId, rows);
  }

  const accounts: CreditUsageAccountReport[] = allUsers.map((user) => {
    const isHealer = isHealerAccountType(user.userType);
    const usage: ServiceUsageCounts = {
      aura: countBillableReadings(user.id, isHealer, auraRows),
      object: countBillableReadings(user.id, isHealer, objectRows),
      numerology: countBillableReadings(user.id, isHealer, numerologyRows),
      vibe: vibeRows.filter((row) => row.userId === user.id).length,
      healerBookings: bookingRows.filter((row) => row.userId === user.id).length,
      journals: journalRows.filter((row) => row.userId === user.id).length,
      meditations: meditationRows.filter((row) => row.userId === user.id).length,
    };
    const { charged, ledgerServiceNet } = chargedFromTransactions(txByUser.get(user.id) || []);
    const currentCredits = creditNumber(user.credits);
    const math = computeUsageCorrection({ currentCredits, usage, ledgerServiceNet });
    return {
      userId: user.id,
      username: user.username,
      userType: user.userType,
      currentCredits,
      usage,
      expectedSpend: math.expectedSpend,
      charged,
      ledgerServiceNet,
      deltaAmount: math.deltaAmount,
      newBalance: math.newBalance,
      hasDiscrepancy: math.hasDiscrepancy,
      willBeNegative: math.newBalance < 0,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    prices: {
      aura_analysis: getServiceCreditCost("aura_analysis"),
      object_analysis: getServiceCreditCost("object_analysis"),
      numerology: getServiceCreditCost("numerology"),
      healer_booking: getServiceCreditCost("healer_booking"),
      vibe_check: getServiceCreditCost("vibe_check"),
      journaling: getServiceCreditCost("journaling"),
      meditation: getServiceCreditCost("meditation"),
    },
    totalUsers: allUsers.length,
    accountsWithDiscrepancy: accounts.filter((account) => account.hasDiscrepancy).length,
    negativeAfterCorrection: accounts.filter((account) => account.newBalance < 0).length,
    alreadyNegative: accounts.filter((account) => account.currentCredits < 0).length,
    accounts,
  };
}

export async function getCreditUsageForUser(userId: number): Promise<CreditUsageAccountReport | null> {
  const report = await getCreditUsageAuditReport();
  return report.accounts.find((account) => account.userId === userId) || null;
}

/**
 * Charge or refund the difference between recorded service spend and official prices.
 * Can take a balance negative. Idempotent: a second run is a no-op.
 */
export async function correctAllCreditUsage(): Promise<CreditUsageCorrectionResult> {
  const report = await getCreditUsageAuditReport();
  const changedUsers: CreditUsageCorrectionResult["changedUsers"] = [];

  for (const account of report.accounts) {
    if (!account.hasDiscrepancy) continue;
    await db.transaction(async (tx) => {
      const [locked] = await tx.select().from(users).where(eq(users.id, account.userId)).for("update");
      if (!locked) return;
      const currentCredits = creditNumber(locked.credits);
      const txs = await tx.select().from(creditTransactions).where(eq(creditTransactions.userId, account.userId));
      const { ledgerServiceNet } = chargedFromTransactions(
        txs.map((row) => ({ transactionType: row.transactionType, amount: creditNumber(row.amount) })),
      );
      const math = computeUsageCorrection({
        currentCredits,
        usage: account.usage,
        ledgerServiceNet,
      });
      if (!math.hasDiscrepancy) return;
      const newCredits = math.newBalance;
      await tx.update(users).set({ credits: newCredits }).where(eq(users.id, account.userId));
      await tx.insert(creditTransactions).values({
        userId: account.userId,
        username: locked.username,
        amount: math.deltaAmount,
        transactionType: USAGE_CORRECTION_TYPE,
        description: usageCorrectionDescription(account.usage, math.expectedSpend, math.deltaAmount),
        balanceAfter: newCredits,
      });
      if (math.deltaAmount < 0) {
        const { consumeCreditGrants } = await import("./credit-grants");
        await consumeCreditGrants(account.userId, -math.deltaAmount, tx);
      }
      if (newCredits <= 0) {
        await tx
          .update(creditGrants)
          .set({ remaining: 0 })
          .where(and(eq(creditGrants.userId, account.userId), gt(creditGrants.remaining, 0)));
      }
      changedUsers.push({
        userId: account.userId,
        username: locked.username,
        creditsBefore: currentCredits,
        creditsAfter: newCredits,
        deltaAmount: math.deltaAmount,
      });
    });
  }

  const after = await getCreditUsageAuditReport();
  return {
    generatedAt: new Date().toISOString(),
    usersProcessed: report.totalUsers,
    usersChanged: changedUsers.length,
    negativeBalances: after.negativeAfterCorrection,
    changedUsers,
    report: after,
  };
}

function usageCorrectionDescription(usage: ServiceUsageCounts, expectedSpend: number, deltaAmount: number): string {
  const parts = [
    `Aura ${usage.aura}×${getServiceCreditCost("aura_analysis")}`,
    `object ${usage.object}×${getServiceCreditCost("object_analysis")}`,
    `numerology ${usage.numerology}×${getServiceCreditCost("numerology")}`,
    `vibe ${usage.vibe}×${getServiceCreditCost("vibe_check")}`,
    `find healer ${usage.healerBookings}×${getServiceCreditCost("healer_booking")}`,
    `journal ${usage.journals}×${getServiceCreditCost("journaling")}`,
    `meditation ${usage.meditations}×${getServiceCreditCost("meditation")}`,
  ];
  const verb = deltaAmount < 0 ? "charged" : "refunded";
  return `Usage priced at official rates (${parts.join(", ")}; expected ${expectedSpend}). ${verb} ${Math.abs(deltaAmount)} credit${Math.abs(deltaAmount) === 1 ? "" : "s"} so the ledger matches activity.`;
}

export { expectedServiceSpend };
