import { asc, eq } from "drizzle-orm";
import { db } from "./db";
import { creditGrants, creditTransactions, users } from "../shared/schema";

type CreditRow = typeof creditTransactions.$inferSelect;
type UserRow = typeof users.$inferSelect;

export type CreditUserReport = {
  userId: number;
  username: string;
  credits: number;
  transactionCount: number;
  creditsIssued: number;
  creditsUsed: number;
  lastTransactionBalance: number | null;
  lastTransactionAt: Date | null;
  chainMismatches: number;
  usernameMismatches: number;
  grantRemaining: number;
  grantMismatch: boolean;
};

export type CreditIntegrityReport = {
  generatedAt: string;
  totalUsers: number;
  usersWithCreditData: number;
  totalTransactions: number;
  totalCreditsIssued: number;
  totalCreditsUsed: number;
  chainMismatches: number;
  balanceMismatches: number;
  usernameMismatches: number;
  grantMismatches: number;
  usersWithoutLedger: number;
  users: CreditUserReport[];
};

function asNumber(value: unknown) {
  return Number(value || 0);
}

function correctionType(type: string) {
  return type === "ledger_opening" || type === "ledger_reconciliation";
}

export async function getCreditIntegrityReport(): Promise<CreditIntegrityReport> {
  const [allUsers, allTransactions, allGrants] = await Promise.all([
    db.select().from(users).orderBy(asc(users.id)),
    db.select().from(creditTransactions).orderBy(asc(creditTransactions.createdAt), asc(creditTransactions.id)),
    db.select().from(creditGrants).orderBy(asc(creditGrants.userId), asc(creditGrants.createdAt), asc(creditGrants.id)),
  ]);

  const txByUser = new Map<number, CreditRow[]>();
  for (const tx of allTransactions) {
    const rows = txByUser.get(tx.userId) || [];
    rows.push(tx);
    txByUser.set(tx.userId, rows);
  }

  const grantsByUser = new Map<number, typeof allGrants>();
  for (const grant of allGrants) {
    const rows = grantsByUser.get(grant.userId) || [];
    rows.push(grant);
    grantsByUser.set(grant.userId, rows);
  }

  const now = Date.now();
  let chainMismatches = 0;
  let balanceMismatches = 0;
  let usernameMismatches = 0;
  let grantMismatches = 0;
  let usersWithoutLedger = 0;
  let totalCreditsIssued = 0;
  let totalCreditsUsed = 0;

  const userReports = allUsers.map((user: UserRow): CreditUserReport => {
    const transactions = txByUser.get(user.id) || [];
    const grants = grantsByUser.get(user.id) || [];
    let previousBalance: number | null = null;
    let userChainMismatches = 0;
    let userUsernameMismatches = 0;
    let creditsIssued = 0;
    let creditsUsed = 0;

    for (const transaction of transactions) {
      const amount = asNumber(transaction.amount);
      if (amount > 0) creditsIssued += amount;
      if (amount < 0) creditsUsed += Math.abs(amount);
      if (
        previousBalance !== null &&
        asNumber(transaction.balanceAfter) !== previousBalance + amount
      ) {
        userChainMismatches += 1;
      }
      if (transaction.username !== user.username) userUsernameMismatches += 1;
      previousBalance = asNumber(transaction.balanceAfter);
    }

    const grantRemaining = grants
      .filter((grant) => grant.remaining > 0 && (!grant.expiresAt || new Date(grant.expiresAt).getTime() > now))
      .reduce((sum, grant) => sum + asNumber(grant.remaining), 0);

    const currentCredits = asNumber(user.credits);
    const grantMismatch = grantRemaining !== Math.max(currentCredits, 0);
    if (transactions.length === 0 && currentCredits !== 0) usersWithoutLedger += 1;
    if (previousBalance !== null && previousBalance !== currentCredits) balanceMismatches += 1;
    if (userChainMismatches) chainMismatches += userChainMismatches;
    if (userUsernameMismatches) usernameMismatches += userUsernameMismatches;
    if (grantMismatch) grantMismatches += 1;
    totalCreditsIssued += creditsIssued;
    totalCreditsUsed += creditsUsed;

    return {
      userId: user.id,
      username: user.username,
      credits: currentCredits,
      transactionCount: transactions.length,
      creditsIssued,
      creditsUsed,
      lastTransactionBalance: previousBalance,
      lastTransactionAt: transactions[transactions.length - 1]?.createdAt || null,
      chainMismatches: userChainMismatches,
      usernameMismatches: userUsernameMismatches,
      grantRemaining,
      grantMismatch,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    totalUsers: allUsers.length,
    usersWithCreditData: userReports.filter((user) => user.transactionCount > 0 || user.credits !== 0).length,
    totalTransactions: allTransactions.length,
    totalCreditsIssued,
    totalCreditsUsed,
    chainMismatches,
    balanceMismatches,
    usernameMismatches,
    grantMismatches,
    usersWithoutLedger,
    users: userReports,
  };
}

export type ReconciliationResult = {
  generatedAt: string;
  usersProcessed: number;
  usersChanged: number;
  changedUsers: Array<{ userId: number; username: string }>;
  transactionsRepaired: number;
  openingTransactionsAdded: number;
  grantsAdded: number;
  usernamesRepaired: number;
  report: CreditIntegrityReport;
};

/**
 * Rebuilds running balance snapshots without changing the current users.credits
 * value. Existing usage amounts are preserved. A transparent opening entry is
 * added when legacy history lacks the original starting balance.
 */
export async function reconcileAllCreditLedgers(): Promise<ReconciliationResult> {
  const allUsers = await db.select().from(users).orderBy(asc(users.id));
  let usersChanged = 0;
  let transactionsRepaired = 0;
  let openingTransactionsAdded = 0;
  let grantsAdded = 0;
  let usernamesRepaired = 0;
  const changedUsers: Array<{ userId: number; username: string }> = [];

  for (const user of allUsers) {
    const changed = await db.transaction(async (tx) => {
      const [lockedUser] = await tx.select().from(users).where(eq(users.id, user.id)).for("update");
      if (!lockedUser) return false;
      let didChange = false;

      const transactions = await tx
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, user.id))
        .orderBy(asc(creditTransactions.createdAt), asc(creditTransactions.id));
      const sourceTransactions = transactions.filter((row) => !correctionType(row.transactionType));
      const currentCredits = asNumber(lockedUser.credits);
      const netAmount = sourceTransactions.reduce((sum, row) => sum + asNumber(row.amount), 0);
      const openingAmount = currentCredits - netAmount;
      const firstSourceAt = sourceTransactions[0]?.createdAt
        ? new Date(sourceTransactions[0].createdAt).getTime() - 1
        : new Date(lockedUser.createdAt).getTime();

      let opening = transactions.find((row) => row.transactionType === "ledger_opening");
      if (opening) {
        if (
          asNumber(opening.amount) !== openingAmount ||
          asNumber(opening.balanceAfter) !== openingAmount ||
          opening.username !== lockedUser.username ||
          new Date(opening.createdAt).getTime() !== firstSourceAt
        ) {
          await tx
            .update(creditTransactions)
            .set({
              username: lockedUser.username,
              amount: openingAmount,
              description: "Opening balance reconstructed from the current balance and recorded history",
              balanceAfter: openingAmount,
              createdAt: new Date(firstSourceAt),
            })
            .where(eq(creditTransactions.id, opening.id));
          didChange = true;
        }
      } else if (openingAmount !== 0 || (sourceTransactions.length === 0 && currentCredits !== 0)) {
        const [created] = await tx
          .insert(creditTransactions)
          .values({
            userId: user.id,
            username: lockedUser.username,
            amount: openingAmount,
            transactionType: "ledger_opening",
            description: "Opening balance reconstructed from the current balance and recorded history",
            balanceAfter: openingAmount,
            createdAt: new Date(firstSourceAt),
          })
          .returning();
        opening = created;
        openingTransactionsAdded += 1;
        didChange = true;
      }

      let runningBalance = opening ? asNumber(openingAmount) : 0;
      for (const row of sourceTransactions) {
        const nextBalance = runningBalance + asNumber(row.amount);
        if (row.username !== lockedUser.username) usernamesRepaired += 1;
        if (asNumber(row.balanceAfter) !== nextBalance || row.username !== lockedUser.username) {
          await tx
            .update(creditTransactions)
            .set({
              username: lockedUser.username,
              balanceAfter: nextBalance,
            })
            .where(eq(creditTransactions.id, row.id));
          transactionsRepaired += 1;
          didChange = true;
        }
        runningBalance = nextBalance;
      }

      // A prior reconciliation entry is kept in the history but normalized to
      // the final balance so repeated runs remain idempotent.
      for (const row of transactions.filter((item) => item.transactionType === "ledger_reconciliation")) {
        if (row.username !== lockedUser.username || asNumber(row.balanceAfter) !== currentCredits) {
          await tx
            .update(creditTransactions)
            .set({ username: lockedUser.username, balanceAfter: currentCredits })
            .where(eq(creditTransactions.id, row.id));
          transactionsRepaired += 1;
          didChange = true;
        }
      }

      const grants = await tx
        .select()
        .from(creditGrants)
        .where(eq(creditGrants.userId, user.id))
        .orderBy(asc(creditGrants.createdAt), asc(creditGrants.id));
      const activeRemaining = grants
        .filter((grant) => grant.remaining > 0 && (!grant.expiresAt || new Date(grant.expiresAt).getTime() > Date.now()))
        .reduce((sum, grant) => sum + asNumber(grant.remaining), 0);

      if (grants.length === 0 && currentCredits > 0) {
        await tx.insert(creditGrants).values({
          userId: user.id,
          amount: currentCredits,
          remaining: currentCredits,
          expiresAt: null,
          source: "legacy_reconciliation",
          note: "Legacy balance migrated without changing the current balance",
          createdByUserId: null,
        });
        grantsAdded += 1;
        didChange = true;
      } else if (activeRemaining < currentCredits) {
        await tx.insert(creditGrants).values({
          userId: user.id,
          amount: currentCredits - activeRemaining,
          remaining: currentCredits - activeRemaining,
          expiresAt: null,
          source: "legacy_reconciliation",
          note: "Grant balance completed to match the current user balance",
          createdByUserId: null,
        });
        grantsAdded += 1;
        didChange = true;
      }

      return didChange;
    });
    if (changed) {
      usersChanged += 1;
      changedUsers.push({ userId: user.id, username: user.username });
    }
  }

  const report = await getCreditIntegrityReport();
  return {
    generatedAt: new Date().toISOString(),
    usersProcessed: allUsers.length,
    usersChanged,
    changedUsers,
    transactionsRepaired,
    openingTransactionsAdded,
    grantsAdded,
    usernamesRepaired,
    report,
  };
}